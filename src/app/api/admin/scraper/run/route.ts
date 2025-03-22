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
    // Usar caminho absoluto para o script e o Python do ambiente virtual
    const scriptPath = path.join(process.cwd(), 'scraper_auto.sh');
    const pythonPath = path.join(process.cwd(), 'venv', 'bin', 'python3');
    
    // Executar o script usando o Python do ambiente virtual
    const command = `${pythonPath} ${scriptPath}`;
    
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr && !stderr.includes('Iniciando extração')) {
      console.error('Erro ao executar o scraper:', stderr);
      return { success: false, message: `Erro na execução: ${stderr}` };
    }
    
    console.log('Saída do scraper:', stdout);
    
    // Tentar extrair estatísticas da saída
    let stats = { received: 0, saved: 0, duplicates: 0, errors: 0 };
    try {
      // Procurar por uma linha JSON com estatísticas na saída
      const statsMatch = stdout.match(/\{[\s\S]*?"stats"[\s\S]*?\}/);
      if (statsMatch) {
        const statsJson = JSON.parse(statsMatch[0]);
        if (statsJson.stats) {
          stats = statsJson.stats;
        }
      }
    } catch (parseError) {
      console.warn('Não foi possível extrair estatísticas da saída:', parseError);
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
    // Verificar permissões (apenas admin pode executar o scraper)
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }
    
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