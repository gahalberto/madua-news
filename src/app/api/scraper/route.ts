import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import OpenAI from 'openai';


export async function POST(request: NextRequest) {
  try {
    // Recebe os dados do scraper
    const scraperData = await request.json();
    
    if (!Array.isArray(scraperData)) {
      return NextResponse.json({ error: 'Dados inválidos. Esperado um array de artigos.' }, { status: 400 });
    }

    // Estatísticas para retornar na resposta
    const stats = {
      received: scraperData.length,
      saved: 0,
      duplicates: 0,
      errors: 0
    };

    // Salva os dados brutos no banco de dados
    const savedArticles = [];
    
    for (const article of scraperData) {
      try {
        // Verificar se já existe um artigo com esse título
        const existingArticle = await prisma.scrapedArticle.findFirst({
          where: {
            title: {
              equals: article.title,
              mode: 'insensitive' // Case insensitive para melhor comparação
            }
          }
        });

        if (existingArticle) {
          console.log(`Artigo já existe: "${article.title}"`);
          stats.duplicates++;
          continue; // Pula para o próximo artigo
        }

        // Se não existe, salva o novo artigo
        const saved = await prisma.scrapedArticle.create({
          data: {
            sourceUrl: article.url,
            title: article.title,
            description: article.description,
            content: article.content,
            status: 'PENDING', // Status inicial: pendente de processamento
            source: 'YNET_NEWS',
          }
        });
        
        savedArticles.push(saved);
        stats.saved++;
      } catch (articleError) {
        console.error(`Erro ao processar artigo: "${article.title}"`, articleError);
        stats.errors++;
      }
    }
    
    // Retorna resposta de sucesso com os IDs dos artigos salvos e estatísticas
    return NextResponse.json({ 
      message: 'Dados processados com sucesso',
      stats,
      scrapedArticleIds: savedArticles.map(article => article.id)
    });
  } catch (error) {
    console.error('Erro ao processar dados do scraper:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 