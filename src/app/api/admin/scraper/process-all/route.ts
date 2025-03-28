import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { notifyNewPost as notifyTelegram } from '@/lib/telegram';
import { notifyNewPost as notifyOneSignal } from '@/lib/onesignal';

// Cliente DeepSeek para tradução
const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-712e38c4b9e3444793dd727ece47f17a',
});

// Função para adicionar delay (sleep)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função para gerar slug a partir do título
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-');
}

// Função para processar um único artigo
async function processArticle(articleId: string) {
  console.log(`Processando artigo ${articleId}...`);
  
  try {
    // Atualiza o status do artigo para processando
    await prisma.scrapedArticle.update({
      where: { id: articleId },
      data: { status: 'PROCESSING' }
    });

    // Busca o artigo no banco de dados
    const article = await prisma.scrapedArticle.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      throw new Error(`Artigo ${articleId} não encontrado`);
    }

    console.log(`Artigo encontrado - Título: ${article.title} - Tamanho do conteúdo: ${article.content.length} caracteres`);

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
    7. Escolha 10 hashtags relevantes para o assunto do artigo, em português
    8. Identifique 5 palavras-chave principais relacionadas ao artigo
    9. Retorne APENAS o JSON como resposta, sem nenhum texto adicional
    
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
      "metaDescription": "Descrição SEO (até 160 caracteres)",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8", "hashtag9", "hashtag10"],
      "keywords": ["palavra-chave1", "palavra-chave2", "palavra-chave3", "palavra-chave4", "palavra-chave5"]
    }
    
    LEMBRE-SE: O campo "content" deve conter TODO o conteúdo traduzido, não apenas um resumo.
    `;

    console.log(`Enviando prompt para DeepSeek com ${prompt.length} caracteres`);

    // Chama a API do DeepSeek
    let completion;
    try {
      completion = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "Você é um assistente especializado em tradução e adaptação de artigos de notícias para o português brasileiro. Responda apenas com JSON válido." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
    } catch (apiError) {
      console.error(`❌ Erro na chamada à API Deepseek: ${apiError instanceof Error ? apiError.message : 'Erro desconhecido'}`);
      // Marcar artigo como com erro
      await prisma.scrapedArticle.update({
        where: { id: articleId },
        data: { status: 'ERROR', errorMessage: `Erro na API: ${apiError instanceof Error ? apiError.message : 'Erro desconhecido'}` }
      });
      throw new Error(`Erro na chamada à API Deepseek: ${apiError instanceof Error ? apiError.message : 'Erro desconhecido'}`);
    }

    // Processa a resposta
    const aiResponse = completion.choices[0].message.content;
    
    if (!aiResponse) {
      throw new Error("Resposta vazia da API DeepSeek");
    }

    console.log(`Resposta recebida da DeepSeek: ${aiResponse.substring(0, 150)}...`);

    // Tenta converter a resposta para objeto JSON
    let processedArticle;
    try {
      processedArticle = JSON.parse(aiResponse);
      
      // Verificar se os campos existem
      console.log(`Campos recebidos: ${Object.keys(processedArticle).join(', ')}`);
      console.log(`Tamanho do título: ${processedArticle.title?.length || 0} caracteres`);
      console.log(`Tamanho do conteúdo: ${processedArticle.content?.length || 0} caracteres`);
      console.log(`Conteúdo (primeiros 200 caracteres): "${processedArticle.content?.substring(0, 200)}..."`);
      
      // Verificações adicionais de qualidade da tradução
      const hasEnglishOnly = /^[a-zA-Z0-9\s.,!?:;()\-"']+$/.test(processedArticle.content?.substring(0, 100) || '');
      const hasPtContent = /[áàâãéèêíïóôõöúüçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÜÇ]/.test(processedArticle.content || '');
      
      // Garantir que todos os campos obrigatórios existam
      processedArticle.title = processedArticle.title || article.title + ' [Tradução automática]';
      processedArticle.excerpt = processedArticle.excerpt || (article.description ? article.description.substring(0, 200) : `Artigo traduzido de ${article.source}`);
      processedArticle.content = processedArticle.content || contentWithLocalImages;
      processedArticle.metaTitle = processedArticle.metaTitle || processedArticle.title.substring(0, 60);
      processedArticle.metaDescription = processedArticle.metaDescription || processedArticle.excerpt.substring(0, 160);
      processedArticle.hashtags = processedArticle.hashtags || [];
      processedArticle.keywords = processedArticle.keywords || [];
      
      // Garantir que temos 10 hashtags
      if (processedArticle.hashtags.length < 10) {
        console.warn(`Número insuficiente de hashtags (${processedArticle.hashtags.length}). Completando até 10...`);
        // Completar com hashtags genéricas baseadas no título se faltar
        const titleWords = processedArticle.title.split(' ')
          .filter((word: string) => word.length > 3)
          .map((word: string) => word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
        
        while (processedArticle.hashtags.length < 10 && titleWords.length > 0) {
          const word = titleWords.shift();
          if (word && !processedArticle.hashtags.includes(word)) {
            processedArticle.hashtags.push(word);
          }
        }
        
        // Se ainda precisar completar
        const defaultHashtags = ['noticia', 'brasil', 'internacional', 'informacao', 'atualidade', 'mundo', 'acontecimento', 'maduanews', 'atualizacao', 'destaque'];
        let i = 0;
        while (processedArticle.hashtags.length < 10 && i < defaultHashtags.length) {
          if (!processedArticle.hashtags.includes(defaultHashtags[i])) {
            processedArticle.hashtags.push(defaultHashtags[i]);
          }
          i++;
        }
      }
      
      // Garantir que temos pelo menos 5 palavras-chave
      if (processedArticle.keywords.length < 5) {
        console.warn(`Número insuficiente de palavras-chave (${processedArticle.keywords.length}). Completando até 5...`);
        // Usar hashtags como fonte de palavras-chave se necessário
        const keywordsFromHashtags = processedArticle.hashtags.slice(0, 5 - processedArticle.keywords.length);
        processedArticle.keywords = [...processedArticle.keywords, ...keywordsFromHashtags];
      }
      
      if (!processedArticle.content || processedArticle.content.length < 10) {
        throw new Error("Conteúdo traduzido está vazio ou muito curto");
      }
      
      if (hasEnglishOnly || !hasPtContent) {
        console.warn("Conteúdo parece estar em inglês ou não contém caracteres portugueses");
        throw new Error("Conteúdo não foi traduzido corretamente");
      }
    } catch (parseError) {
      console.error("Erro ao processar resposta JSON:", parseError);
      
      // Tentar extrair JSON se estiver envolto em texto
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          processedArticle = JSON.parse(jsonMatch[0]);
          console.log("JSON extraído de texto: ", Object.keys(processedArticle).join(', '));
        } catch (e) {
          console.error("Falha ao extrair JSON de texto:", e);
          
          // Verificar se é possível corrigir o JSON manualmente
          try {
            // Remover caracteres problemáticos comuns
            let cleanedJson = jsonMatch[0]
              .replace(/[\u0000-\u001F]+/g, '') // caracteres de controle
              .replace(/,\s*}/g, '}')           // vírgulas antes de chaves fechadas
              .replace(/,\s*]/g, ']');          // vírgulas antes de colchetes fechados
              
            processedArticle = JSON.parse(cleanedJson);
            console.log("JSON corrigido manualmente: ", Object.keys(processedArticle).join(', '));
          } catch (fixError) {
            // Se ainda falhar, registrar o erro e o conteúdo para diagnóstico
            console.error("Falha ao corrigir JSON manualmente:", fixError);
            console.log("Resposta recebida:", aiResponse);
            throw new Error("Formato de resposta inválido da API DeepSeek");
          }
        }
      } else {
        console.log("Resposta recebida:", aiResponse);
        throw new Error("Formato de resposta inválido da API DeepSeek");
      }
    }

    // Cria um slug a partir do título
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

    console.log(`Criando post com título: ${processedArticle.title} e conteúdo de ${formattedContent.length} caracteres`);
    console.log(`Imagem principal: ${featuredImage || 'Não encontrada'}`);

    // Cria o post no blog
    const postObj: any = {
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
    };
    
    if (processedArticle.keywords) {
      postObj.keywords = processedArticle.keywords;
    }
    
    const post = await prisma.post.create({
      data: postObj
    });

    console.log(`Post criado com ID: ${post.id} - Título: ${post.title}`);

    // Atualiza o status do artigo scrapado
    const articleUpdate: any = { 
      status: 'PROCESSED',
      processedAt: new Date(),
      postId: post.id,
    };
    
    if (processedArticle.hashtags) {
      articleUpdate.hashtags = processedArticle.hashtags;
    }
    
    if (processedArticle.keywords) {
      articleUpdate.keywords = processedArticle.keywords;
    }
    
    await prisma.scrapedArticle.update({
      where: { id: articleId },
      data: articleUpdate
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
      console.error(`Erro ao enviar notificação para o Telegram (post ${post.id}):`, telegramError);
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
      console.error(`Erro ao enviar notificação push via OneSignal (post ${post.id}):`, oneSignalError);
      // Não interrompe o fluxo principal em caso de erro no OneSignal
    }

    console.log(`✅ Artigo ${articleId} processado com sucesso e publicado como post ${post.id}`);
    return { success: true, postId: post.id };
  } catch (error) {
    console.error(`❌ Erro ao processar artigo ${articleId}:`, error);
    
    // Atualiza o status do artigo para erro
    await prisma.scrapedArticle.update({
      where: { id: articleId },
      data: { 
        status: 'ERROR',
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    });
    
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

// Endpoint para processar automaticamente todos os artigos pendentes
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação (opcional para chamadas automáticas)
    const { searchParams } = new URL(request.url);

    // Buscar artigos pendentes
    const pendingArticles = await prisma.scrapedArticle.findMany({
      where: { status: 'PENDING' },
      select: { id: true }
    });
    
    console.log(`Encontrados ${pendingArticles.length} artigos pendentes para processar.`);
    
    if (pendingArticles.length === 0) {
      return NextResponse.json({ 
        message: 'Nenhum artigo pendente para processar.',
        processing: 0
      });
    }
    
    // Iniciar processamento em background e executar
    const processPromise = (async () => {
      const results = {
        total: pendingArticles.length,
        success: 0,
        failed: 0,
        articles: [] as { id: string; success: boolean; error?: string; postId?: string }[]
      };
      
      for (const article of pendingArticles) {
        try {
          // Processar cada artigo sequencialmente
          const result = await processArticle(article.id);
          
          if (result.success) {
            results.success++;
            results.articles.push({ 
              id: article.id, 
              success: true,
              postId: result.postId
            });
          } else {
            results.failed++;
            results.articles.push({ 
              id: article.id, 
              success: false,
              error: result.error
            });
          }
          
          // Pequena pausa entre os processamentos para evitar sobrecarga
          await sleep(1000);
        } catch (error) {
          results.failed++;
          results.articles.push({ 
            id: article.id, 
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }
      
      console.log(`Processamento finalizado: ${results.success} sucesso, ${results.failed} falhas`);
    })();
    
    // Executar a promise em background
    processPromise.catch(error => {
      console.error("[PROCESS_ALL_BACKGROUND_ERROR]", error);
    });

    // Responder imediatamente
    return NextResponse.json({ 
      message: `Iniciado processamento de ${pendingArticles.length} artigos pendentes.`,
      processing: pendingArticles.length
    });
  } catch (error) {
    console.error("Erro ao processar artigos pendentes:", error);
    return NextResponse.json({ 
      error: 'Erro ao iniciar processamento', 
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}