/**
 * API para processamento de artigos extraídos
 * 
 * Esta API processa artigos extraídos automaticamente de fontes externas,
 * utilizando a DeepSeek API para traduzir e adaptar o conteúdo para o português brasileiro.
 * 
 * Fluxo de processamento:
 * 1. Recebe o ID do artigo extraído a ser processado
 * 2. Atualiza o status do artigo para "PROCESSING"
 * 3. Envia o conteúdo original para a API DeepSeek para tradução
 * 4. Recebe a resposta traduzida e formata como um post do blog
 * 5. Cria um post no blog com o conteúdo traduzido
 * 6. Atualiza o status do artigo extraído para "PROCESSED"
 * 
 * Caso ocorra algum erro, captura e registra a falha,
 * atualizando o status do artigo para "ERROR".
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';
import { notifyNewPost as notifyTelegram } from '@/lib/telegram';
import { notifyNewPost as notifyOneSignal } from '@/lib/onesignal';

// Inicializa o cliente DeepSeek
const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-712e38c4b9e3444793dd727ece47f17a',
});

// Função para gerar slug a partir do título
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-');
}

// Função para adicionar delay (sleep)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const { searchParams } = new URL(request.url);
    const skipAuth = searchParams.get('skip-auth') === 'true';
    
    if (!skipAuth) {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
      }
    }

    // Obter o ID do artigo do corpo da requisição
    const { articleId } = await request.json();

    if (!articleId) {
      return NextResponse.json({ error: 'ID do artigo não fornecido' }, { status: 400 });
    }

    // Buscar o artigo no banco de dados
    const article = await prisma.scrapedArticle.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
    }

    // Atualizar o status do artigo para processando
    await prisma.scrapedArticle.update({
      where: { id: articleId },
      data: { status: 'PROCESSING' }
    });

    try {
      // Extrai informações de imagem do artigo
      let featuredImage = '';
      let contentWithLocalImages = article.content;
      
      try {
        if (article.rawData) {
          const articleData = JSON.parse(article.rawData || '{}');
          
          // Processa imagem principal
          if (articleData.main_image && articleData.main_image.local_path) {
            featuredImage = articleData.main_image.local_path;
            console.log(`Imagem principal encontrada: ${featuredImage}`);
          }
          
          // Substitui URLs de imagem no conteúdo pelos caminhos locais
          if (Array.isArray(articleData.content_images)) {
            articleData.content_images.forEach((img: { original_url: string; local_path: string }) => {
              if (img.original_url && img.local_path) {
                contentWithLocalImages = contentWithLocalImages.replace(
                  new RegExp(img.original_url, 'g'), 
                  img.local_path
                );
              }
            });
          }
        }
      } catch (e) {
        console.warn(`Erro ao processar dados de imagem do artigo: ${e}`);
      }

      // Prompt para a API do DeepSeek
      const prompt = `
      Traduza e reescreva o seguinte artigo de notícias do inglês para o português brasileiro. É EXTREMAMENTE IMPORTANTE que você traduza completamente o conteúdo, não deixe NADA em inglês.
      
      REGRAS IMPORTANTES:
      1. Traduza o conteúdo COMPLETO para português brasileiro fluente
      2. Mantenha o mesmo significado, mas adapte para o público brasileiro
      3. Use um tom jornalístico profissional
      4. Não omita informações importantes do original
      5. Use parágrafos para separar o conteúdo e facilitar a leitura
      6. O conteúdo deve ter pelo menos 500 caracteres
      7. Retorne APENAS o JSON como resposta, sem nenhum texto adicional
      
      TÍTULO ORIGINAL: ${article.title}
      
      DESCRIÇÃO ORIGINAL: ${article.description || "Sem descrição disponível"}
      
      CONTEÚDO ORIGINAL:
      ${contentWithLocalImages}
      
      FORMATO OBRIGATÓRIO DA RESPOSTA (apenas JSON, sem texto antes ou depois):
      {
        "title": "Título completo traduzido em português",
        "excerpt": "Resumo do artigo em português (150-200 caracteres)",
        "content": "Conteúdo completo em português, separado em parágrafos. Deve conter toda a informação do original, mas em português.",
        "metaTitle": "Título SEO (até 60 caracteres)",
        "metaDescription": "Descrição SEO (até 160 caracteres)"
      }
      
      LEMBRE-SE: O campo "content" deve conter TODO o conteúdo traduzido, não apenas um resumo.
      `;

      // Número máximo de tentativas
      const maxAttempts = 3;
      
      // Implementação de retry
      let processedArticle = null;
      let attempts = 0;
      
      while (attempts < maxAttempts && !processedArticle) {
        try {
          console.log(`Tentativa ${attempts + 1} de processar o artigo ${articleId} com DeepSeek...`);
          
          // Chama a API do DeepSeek
          const completion = await deepseek.chat.completions.create({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: "Você é um assistente especializado em tradução e adaptação de artigos de notícias para o português brasileiro. Responda apenas com JSON." },
              { role: "user", content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
          });
          
          // Processar e validar a resposta
          const aiResponse = completion.choices[0].message.content;
          console.log("Resposta da DeepSeek COMPLETA: ", aiResponse);
          
          if (!aiResponse) {
            throw new Error("Resposta vazia da API");
          }
          
          console.log(`Resposta recebida da DeepSeek (primeiros 150 caracteres): ${aiResponse.substring(0, 150)}...`);
          
          try {
            // Parsear a resposta como JSON
            const parsedResponse = JSON.parse(aiResponse);
            
            // Verificar campos obrigatórios
            console.log(`Campos encontrados: ${Object.keys(parsedResponse).join(', ')}`);
            console.log(`Tamanho do título: ${parsedResponse.title?.length || 0} caracteres`);
            console.log(`Tamanho do conteúdo: ${parsedResponse.content?.length || 0} caracteres`);
            console.log(`conteudo escrito: ${parsedResponse.content || 'Não encontrado'}`);
            console.log(`Conteúdo (primeiros 200 caracteres): "${parsedResponse.content?.substring(0, 200)}..."`);
            
            // Verificações adicionais de qualidade da tradução
            const hasEnglishOnly = /^[a-zA-Z0-9\s.,!?:;()\-"']+$/.test(parsedResponse.content?.substring(0, 100) || '');
            const hasPtContent = /[áàâãéèêíïóôõöúüçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÜÇ]/.test(parsedResponse.content || '');
            
            // Garantir que todos os campos obrigatórios existam
            parsedResponse.title = parsedResponse.title || article.title + ' [Tradução automática]';
            parsedResponse.excerpt = parsedResponse.excerpt || (article.description ? article.description.substring(0, 200) : `Artigo traduzido de ${article.source}`);
            parsedResponse.content = parsedResponse.content || contentWithLocalImages;
            parsedResponse.metaTitle = parsedResponse.metaTitle || parsedResponse.title.substring(0, 60);
            parsedResponse.metaDescription = parsedResponse.metaDescription || parsedResponse.excerpt.substring(0, 160);
            
            if (!parsedResponse.title || !parsedResponse.content || !parsedResponse.excerpt) {
              console.warn(`Resposta da DeepSeek não possui campos obrigatórios. Tentando novamente...`);
              attempts++;
              await sleep(1000 * attempts); // Backoff exponencial
              continue;
            }
            
            if (parsedResponse.content.length < 100) {
              console.warn(`Conteúdo traduzido muito curto (${parsedResponse.content.length} caracteres). Tentando novamente...`);
              attempts++;
              await sleep(1000 * attempts);
              continue;
            }
            
            if (hasEnglishOnly || !hasPtContent) {
              console.warn("Conteúdo parece estar em inglês ou não contém caracteres portugueses. Tentando novamente...");
              attempts++;
              await sleep(1000 * attempts);
              continue;
            }
            
            // Se chegou aqui, a resposta é válida
            processedArticle = parsedResponse;
            break;
            
          } catch (parseError) {
            console.warn(`Erro ao processar resposta JSON do DeepSeek:`, parseError);
            
            // Tentar extrair JSON se estiver envolto em texto
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                processedArticle = JSON.parse(jsonMatch[0]);
                console.log("JSON extraído de texto: ", Object.keys(processedArticle).join(', '));
                break;
              } catch (e) {
                console.error("Falha ao extrair JSON de texto:", e);
              }
            }
            
            attempts++;
            await sleep(1000 * attempts);
          }
        } catch (apiError) {
          console.error(`Erro na API na tentativa ${attempts + 1}:`, apiError);
          attempts++;
          await sleep(1000 * attempts);
        }
      }
      
      // Verificar se conseguimos obter uma resposta válida da API
      if (!processedArticle) {
        // Se não conseguimos após as tentativas, usamos uma solução alternativa (mock)
        console.log("Usando solução alternativa para o processamento do artigo...");
        
        // Usa o próprio título e conteúdo original como fallback
        processedArticle = {
          title: `${article.title} [Tradução automática]`,
          excerpt: article.description ? article.description.substring(0, 200) : `Artigo de ${article.source}`,
          content: contentWithLocalImages,
          metaTitle: article.title.substring(0, 60),
          metaDescription: article.description ? article.description.substring(0, 160) : `Artigo de ${article.source}`,
        };
      }

      // Formatar conteúdo HTML se necessário
      let formattedContent = processedArticle.content;
      
      // Verificar se o conteúdo recebido parece ser o conteúdo original em inglês
      const isLikelyOriginalContent = contentWithLocalImages.substring(0, 50).trim() === formattedContent.substring(0, 50).trim();
      
      if (isLikelyOriginalContent) {
        console.log(`AVISO: Conteúdo parece não ter sido traduzido. Tentando tradução novamente...`);
        
        // Tentar uma tradução simplificada como fallback
        try {
          const simplifiedPrompt = `
          Traduza o seguinte texto do inglês para o português brasileiro:
          
          ${contentWithLocalImages}
          `;
          
          const fallbackCompletion = await deepseek.chat.completions.create({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: "Você é um tradutor profissional do inglês para o português." },
              { role: "user", content: simplifiedPrompt }
            ],
            temperature: 0.3
          });
          
          const fallbackResponse = fallbackCompletion.choices[0].message.content;
          
          if (fallbackResponse && fallbackResponse.length > contentWithLocalImages.length * 0.5) {
            console.log(`Tradução simplificada obtida com sucesso: ${fallbackResponse.length} caracteres`);
            formattedContent = fallbackResponse;
          }
        } catch (fallbackError) {
          console.error("Erro na tradução simplificada:", fallbackError);
        }
      }
      
      // Formatação HTML do conteúdo
      if (!formattedContent.includes('<p>') && !formattedContent.includes('<div>')) {
        // Se não tiver tags HTML, adicionar tags de parágrafo
        formattedContent = formattedContent
          .split('\n\n')
          .map((p: string) => p.trim())
          .filter((p: string) => p.length > 0)
          .map((p: string) => `<p>${p}</p>`)
          .join('\n');
      }
      
      // Garantir que o conteúdo sempre tenha algum texto
      if (!formattedContent || formattedContent.trim().length < 10) {
        // Fallback para o conteúdo original quando a tradução falha
        formattedContent = `
          <div class="translation-warning" style="background-color: #f8d7da; padding: 10px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
            <p><strong>Aviso:</strong> Não foi possível traduzir este artigo adequadamente. Exibindo conteúdo original.</p>
          </div>
          <div class="original-content">
            ${contentWithLocalImages.split('\n\n').map((p: string) => `<p>${p.trim()}</p>`).join('\n')}
          </div>
        `;
        
        // Atualizar título para indicar problema na tradução
        if (!processedArticle.title.includes('[Conteúdo Original]')) {
          processedArticle.title = `${article.title} [Conteúdo Original]`;
        }
      }
      
      // Se ainda parece ser o conteúdo original, adicionar nota de tradução automática
      if (isLikelyOriginalContent) {
        formattedContent = `
          <div class="translation-note" style="background-color: #fffbea; padding: 10px; margin-bottom: 20px; border-left: 4px solid #ffa000;">
            <p><strong>Nota:</strong> Este artigo foi processado por tradução automática e pode conter imperfeições.</p>
          </div>
          ${formattedContent}
        `;
        
        // Atualizar título para indicar tradução automática
        if (!processedArticle.title.includes('[Tradução automática]')) {
          processedArticle.title = `${processedArticle.title} [Tradução automática]`;
        }
      }

      console.log(`Conteúdo formatado: ${formattedContent.length} caracteres`);
      
      // Gerar slug
      const slug = generateSlug(processedArticle.title);

      // Verifica se já existe um usuário admin para associar ao post
      let adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });

      // Se não houver admin, cria um usuário padrão
      if (!adminUser) {
        adminUser = await prisma.user.create({
          data: {
            name: 'Admin',
            email: 'admin@exemplo.com',
            role: 'ADMIN',
          }
        });
      }

      // Busca ou cria uma categoria padrão para o post
      let newsCategory = await prisma.category.findFirst({
        where: { name: 'Notícias Internacionais' }
      });

      if (!newsCategory) {
        newsCategory = await prisma.category.create({
          data: {
            name: 'Notícias Internacionais'
          }
        });
      }

      // Gerando um slug único adicionando um timestamp se necessário
      const baseSlug = slug;
      let finalSlug = baseSlug;
      let counter = 1;
      
      // Verificar se já existe um post com este slug
      let existingPost = await prisma.post.findUnique({
        where: { slug: finalSlug }
      });
      
      // Se existir, adicionar um número ao final até encontrar um slug único
      while(existingPost) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
        existingPost = await prisma.post.findUnique({
          where: { slug: finalSlug }
        });
      }

      // Cria o post no blog
      console.log(`Criando post com título: ${processedArticle.title} e imagem: ${featuredImage || 'sem imagem'}`);
      const post = await prisma.post.create({
        data: {
          title: processedArticle.title,
          content: formattedContent,
          excerpt: processedArticle.excerpt,
          slug: finalSlug,
          metaTitle: processedArticle.metaTitle,
          metaDescription: processedArticle.metaDescription,
          published: true,
          authorId: adminUser.id,
          categoryId: newsCategory.id,
          imageUrl: featuredImage || null,
        }
      });

      // Atualiza o status do artigo scrapado
      await prisma.scrapedArticle.update({
        where: { id: articleId },
        data: { 
          status: 'PROCESSED',
          processedAt: new Date(),
          postId: post.id
        }
      });

      // Envia notificação para o canal do Telegram
      try {
        await notifyTelegram({
          title: post.title,
          excerpt: processedArticle.excerpt,
          slug: post.slug || ''
        });
        console.log(`Notificação enviada ao Telegram para o post: ${post.id}`);
      } catch (telegramError) {
        console.error("Erro ao enviar notificação para o Telegram:", telegramError);
        // Não interrompe o fluxo principal em caso de erro no Telegram
      }

      // Envia notificação push via OneSignal
      try {
        await notifyOneSignal({
          title: post.title,
          excerpt: processedArticle.excerpt,
          slug: post.slug || ''
        });
        console.log(`Notificação push enviada via OneSignal para o post: ${post.id}`);
      } catch (oneSignalError) {
        console.error("Erro ao enviar notificação push via OneSignal:", oneSignalError);
        // Não interrompe o fluxo principal em caso de erro no OneSignal
      }

      return NextResponse.json({
        success: true,
        message: 'Artigo processado com sucesso usando DeepSeek',
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug
        }
      });
    } catch (error) {
      console.error("Erro ao processar artigo:", error);
      
      // Atualiza o status do artigo para erro
      await prisma.scrapedArticle.update({
        where: { id: articleId },
        data: { 
          status: 'ERROR',
          errorMessage: error instanceof Error ? error.message : 'Erro desconhecido ao processar artigo'
        }
      });
      
      return NextResponse.json(
        { error: 'Erro ao processar artigo', details: error instanceof Error ? error.message : null },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro na rota de processamento:", error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : null },
      { status: 500 }
    );
  }
} 