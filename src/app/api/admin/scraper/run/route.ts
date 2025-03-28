import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs';
import YnetNewsScraper from '@/utils/ynetnewsScraper';

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
    
    // Estatísticas básicas
    const stats = {
      received: articles.length,
      saved: articles.length,
      duplicates: 0,
      errors: 0
    };
    
    // Criar mensagem com base nas estatísticas
    let message = 'Scraper executado com sucesso.';
    if (stats.saved > 0) {
      message += ` ${stats.saved} novos artigos extraídos.`;
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