import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

// Inicializa o cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Função para gerar slug a partir do título
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-');
}

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

    // Extrai informações de imagem do artigo
    let featuredImage = '';
    let contentWithLocalImages = article.content;
    
    try {
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
    } catch (e) {
      console.warn(`Erro ao processar dados de imagem: ${e}`);
    }

    // Prompt para a API do ChatGPT
    const prompt = `
    Traduza e reescreva o seguinte artigo de notícias do inglês para o português brasileiro.
    O artigo deve ficar em formato adequado para blog, com parágrafos bem estruturados.
    Mantenha as informações importantes, mas adapte para uma linguagem mais amigável e adequada para o contexto brasileiro.
    
    TÍTULO ORIGINAL: ${article.title}
    
    DESCRIÇÃO ORIGINAL: ${article.description}
    
    CONTEÚDO ORIGINAL:
    ${contentWithLocalImages}
    
    Responda apenas com um JSON no seguinte formato:
    {
      "title": "Título traduzido em português",
      "excerpt": "Resumo/descrição de até 200 caracteres em português",
      "content": "Conteúdo completo em português com formatação HTML adequada para blog",
      "metaTitle": "Título SEO (até 60 caracteres)",
      "metaDescription": "Descrição SEO (até 160 caracteres)"
    }
    `;

    // Chama a API do OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Ou outro modelo disponível
      messages: [
        { role: "system", content: "Você é um assistente especializado em tradução e adaptação de artigos de notícias para o português brasileiro." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Processa a resposta
    const aiResponse = completion.choices[0].message.content;
    
    if (!aiResponse) {
      throw new Error("Resposta vazia da API OpenAI");
    }

    // Converte a resposta para objeto
    const processedArticle = JSON.parse(aiResponse);

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

    // Cria o post no blog
    const post = await prisma.post.create({
      data: {
        title: processedArticle.title,
        content: processedArticle.content,
        excerpt: processedArticle.excerpt,
        slug: slug,
        metaTitle: processedArticle.metaTitle,
        metaDescription: processedArticle.metaDescription,
        published: true,
        authorId: adminUser.id,
        categoryId: newsCategory.id,
        featuredImage: featuredImage || null,
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

    console.log(`✅ Artigo ${articleId} processado com sucesso e publicado como post ${post.id}`);
    return true;
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
    
    return false;
  }
}

async function processAllPendingArticles() {
  try {
    // Busca todos os artigos pendentes
    const pendingArticles = await prisma.scrapedArticle.findMany({
      where: { status: 'PENDING' },
      select: { id: true }
    });
    
    console.log(`Encontrados ${pendingArticles.length} artigos pendentes para processar.`);
    
    if (pendingArticles.length === 0) {
      console.log('Nenhum artigo pendente para processar.');
      return;
    }
    
    // Processa cada artigo sequencialmente
    let successCount = 0;
    let errorCount = 0;
    
    for (const article of pendingArticles) {
      const success = await processArticle(article.id);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
      
      // Pausa entre as chamadas para evitar limites de API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\nProcessamento concluído!`);
    console.log(`✅ ${successCount} artigos processados com sucesso`);
    console.log(`❌ ${errorCount} artigos com erro`);
  } catch (error) {
    console.error('Erro ao processar artigos pendentes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executa o script
processAllPendingArticles(); 