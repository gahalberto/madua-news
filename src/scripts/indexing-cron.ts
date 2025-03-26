#!/usr/bin/env node

/**
 * Script de CRON para automatizar a indexação de URLs no Google
 * 
 * Este script pode ser executado via cron job para acionar a indexação de URLs
 * em horários específicos do dia.
 * 
 * Horários recomendados: 9:00, 12:00, 15:00, 18:00 e 21:00
 * 
 * Exemplo de configuração do crontab:
 * 0 9,12,15,18,21 * * * cd /caminho/para/projeto && npx ts-node src/scripts/indexing-cron.ts
 */

import { indexMultipleUrls, getLatestArticleUrls } from '../lib/googleIndexing';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

async function main() {
  try {
    const startTime = new Date();
    console.log(`[${startTime.toISOString()}] Iniciando processo de indexação automática...`);

    // Verificar se as credenciais de API estão configuradas
    const clientEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      console.error('Erro: Credenciais do Google não configuradas nas variáveis de ambiente.');
      console.error('Configure GOOGLE_INDEXING_CLIENT_EMAIL e GOOGLE_INDEXING_PRIVATE_KEY no arquivo .env');
      process.exit(1);
    }

    // Obter a hora atual para logar
    const currentHour = new Date().getHours();
    console.log(`Executando indexação para o horário: ${currentHour}:00`);

    // Buscar URLs de artigos recentes
    console.log('Buscando URLs recentes para indexação...');
    const urls = await getLatestArticleUrls(15); // Indexar os 15 artigos mais recentes

    if (urls.length === 0) {
      console.log('Nenhuma URL encontrada para indexação. Encerrando processo.');
      process.exit(0);
    }

    console.log(`Encontradas ${urls.length} URLs para indexação:`);
    urls.forEach((url, idx) => console.log(`${idx + 1}. ${url}`));

    // Iniciar processo de indexação
    console.log('Iniciando submissão de URLs para a API de Indexação do Google...');
    const results = await indexMultipleUrls(urls);

    // Calcular estatísticas
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    // Mostrar resultados
    console.log('\nResultado da indexação:');
    console.log(`- Total de URLs: ${urls.length}`);
    console.log(`- URLs indexadas com sucesso: ${successCount}`);
    console.log(`- Falhas de indexação: ${failureCount}`);

    // Mostrar detalhes de erros, se houver
    if (failureCount > 0) {
      console.log('\nDetalhes das falhas:');
      results
        .filter(r => !r.success)
        .forEach((result, idx) => {
          console.log(`Falha ${idx + 1}: ${result.url}`);
          console.log(`  Erro: ${result.error}`);
        });
    }

    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;
    console.log(`\n[${endTime.toISOString()}] Processo concluído em ${duration.toFixed(2)} segundos.`);
  } catch (error) {
    console.error('Erro fatal durante o processo de indexação:', error);
    process.exit(1);
  }
}

// Executar o script
main(); 