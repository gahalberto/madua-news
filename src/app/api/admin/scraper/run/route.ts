import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

// Função para executar o scraper
async function runScraper(): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  try {
    // Usar caminho absoluto para o script
    const scriptPath = path.join(process.cwd(), 'scraper_auto.sh');
    
    // Executar o script shell
    const command = `bash ${scriptPath}`;
    
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr && !stderr.includes('Iniciando extração')) {
      console.error('Erro ao executar o scraper:', stderr);
      return { success: false, message: `Erro na execução: ${stderr}` };
    }
    
    console.log('Saída do scraper:', stdout);
    
    // Tentar extrair estatísticas da saída
    let stats = { received: 0, saved: 0, duplicates: 0, errors: 0 };
    try {
      // Procurar por uma linha JSON com estatísticas na saída - regex mais robusto
      const statsMatch = stdout.match(/\{"message"[^{]*"stats":\s*(\{[^}]+\})/);
      if (statsMatch && statsMatch[1]) {
        // Extrair apenas o objeto stats
        try {
          const statsObj = JSON.parse(`{${statsMatch[1].replace(/,$/, '')}}`);
          stats = statsObj;
          console.log('Estatísticas extraídas com sucesso:', stats);
        } catch (innerError) {
          console.warn('Erro ao parsear objeto de estatísticas:', innerError);
          console.warn('Texto encontrado:', statsMatch[1]);
        }
      } else {
        // Alternativa: extrair valores diretamente das linhas de resumo
        const receivedMatch = stdout.match(/Artigos recebidos: (\d+)/);
        const savedMatch = stdout.match(/Artigos novos salvos: (\d+)/);
        const duplicatesMatch = stdout.match(/Artigos duplicados ignorados: (\d+)/);
        const errorsMatch = stdout.match(/Erros durante processamento: (\d+)/);
        
        if (receivedMatch) stats.received = parseInt(receivedMatch[1]);
        if (savedMatch) stats.saved = parseInt(savedMatch[1]);
        if (duplicatesMatch) stats.duplicates = parseInt(duplicatesMatch[1]);
        if (errorsMatch) stats.errors = parseInt(errorsMatch[1]);
        
        console.log('Estatísticas extraídas do texto de resumo:', stats);
      }
    } catch (parseError) {
      console.warn('Não foi possível extrair estatísticas da saída:', parseError);
      console.warn('Trecho da saída:', stdout.substring(0, 500) + '...');
    }
    
    // Criar mensagem com base nas estatísticas
    let message = 'Scraper executado com sucesso.';
    if (stats.saved > 0) {
      message += ` ${stats.saved} novos artigos importados.`;
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
    console.error('Erro ao executar o script de scraper:', error);
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