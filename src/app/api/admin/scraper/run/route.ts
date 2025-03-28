import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs';
import YnetNewsScraper from '@/utils/ynetnewsScraper';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface ArticleImage {
  original_url: string;
  local_path: string;
}

interface Article {
  title: string;
  description: string;
  content: string;
  url: string;
  main_image: {
    original_url: string;
    local_path: string;
  };
  content_images: ArticleImage[];
}

// Função para executar o scraper
async function runScraper(): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  try {
    console.log("Iniciando o scraper JavaScript...");
    
    // Criar uma instância do scraper
    const scraper = new YnetNewsScraper();
    
    // Executar o scraping de 10 artigos
    console.log("Extraindo artigos...");
    const articles = await scraper.scrapeArticles(10);
    
    // Salvar resultado em arquivo JSON
    const outputPath = path.join(process.cwd(), 'ynetnews_articles.json');
    scraper.saveToJson(outputPath);
    
    console.log(`Scraping concluído. ${articles.length} artigos extraídos.`);
    
    // Processar cada artigo
    let stats = {
      received: articles.length,
      saved: 0,
      duplicates: 0,
      errors: 0
    };
    
    for (const article of articles) {
      try {
        // Verificar se o artigo já existe
        const existingArticle = await prisma.scrapedArticle.findFirst({
          where: {
            OR: [
              { sourceUrl: article.url },
              { title: article.title }
            ]
          }
        });
        
        if (existingArticle) {
          console.log(`Artigo já existe: "${article.title}"`);
          stats.duplicates++;
          continue;
        }
        
        // Criar o artigo no banco
        const newArticle = await prisma.scrapedArticle.create({
          data: {
            title: article.title,
            description: article.description,
            content: article.content,
            sourceUrl: article.url,
            source: 'YNET_NEWS',
            status: 'PENDING',
            rawData: JSON.stringify({
              main_image: article.main_image,
              content_images: article.content_images
            })
          }
        });
        
        console.log(`Artigo salvo: "${article.title}"`);
        stats.saved++;
        
        // Enviar para tradução
        try {
          const translationResponse = await fetch('/api/admin/translate-article', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              articleId: newArticle.id
            })
          });
          
          if (!translationResponse.ok) {
            throw new Error(`Erro ao iniciar tradução: ${translationResponse.statusText}`);
          }
          
          console.log(`Tradução iniciada para o artigo: "${article.title}"`);
        } catch (translationError) {
          console.error(`Erro ao enviar para tradução: ${translationError instanceof Error ? translationError.message : 'Erro desconhecido'}`);
          stats.errors++;
        }
        
      } catch (articleError) {
        console.error(`Erro ao processar artigo: ${articleError instanceof Error ? articleError.message : 'Erro desconhecido'}`);
        stats.errors++;
      }
    }
    
    // Criar mensagem com base nas estatísticas
    let message = 'Scraper executado com sucesso.';
    if (stats.saved > 0) {
      message += ` ${stats.saved} novos artigos salvos.`;
    }
    if (stats.duplicates > 0) {
      message += ` ${stats.duplicates} artigos duplicados ignorados.`;
    }
    if (stats.errors > 0) {
      message += ` ${stats.errors} erros encontrados.`;
    }
    
    return { 
      success: true, 
      message,
      details: { stats }
    };
  } catch (error) {
    console.error('Erro ao executar o scraper:', error);
    return { 
      success: false, 
      message: `Erro ao executar o scraper: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

export async function POST() {
  try {
    // Executar o scraper
    const result = await runScraper();
    
    if (result.success) {
      return NextResponse.json({ 
        message: result.message,
        details: result.details 
      });
    } else {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro na rota de execução do scraper:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : null },
      { status: 500 }
    );
  }
} 