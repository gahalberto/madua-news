/**
 * Biblioteca para integração com a API de Indexação do Google
 * 
 * Esta biblioteca fornece funções para autenticar e enviar URLs para a API de Indexação do Google,
 * permitindo solicitar a indexação rápida de URLs específicas no mecanismo de busca do Google.
 */

import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Tipos para parâmetros e respostas
interface GoogleCredentials {
  client_email: string;
  private_key: string;
}

type IndexingAction = 'URL_UPDATED' | 'URL_DELETED';

interface IndexingResult {
  url: string;
  action: IndexingAction;
  success: boolean;
  error?: string;
  notificationResponse?: any;
}

/**
 * Cria um cliente autenticado para a API de Indexação do Google usando credenciais de conta de serviço
 */
async function createAuthorizedClient(credentials: GoogleCredentials): Promise<JWT> {
  try {
    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    // Força a autenticação para garantir que as credenciais são válidas
    await client.authorize();
    return client;
  } catch (error) {
    console.error('[GoogleIndexing] Erro ao autenticar com a API do Google:', error);
    throw new Error(`Falha na autenticação com a API do Google: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Solicita a indexação de uma URL específica na API do Google
 */
export async function indexUrl(url: string, action: IndexingAction = 'URL_UPDATED'): Promise<IndexingResult> {
  try {
    // Verifica se as credenciais existem no ambiente
    // Compatibilidade com ambos os formatos de nome de variável
    const clientEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      throw new Error('Credenciais do Google não configuradas nas variáveis de ambiente');
    }

    // Cria o cliente autorizado
    const client = await createAuthorizedClient({
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'), // Substitui \\n por \n se necessário
    });

    // Cria instância da API de Indexação
    const indexing = google.indexing({
      version: 'v3',
      auth: client,
    });

    // Envia a solicitação de indexação
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: action,
      },
    });

    return {
      url,
      action,
      success: true,
      notificationResponse: response.data,
    };
  } catch (error) {
    console.error(`[GoogleIndexing] Erro ao solicitar indexação para URL ${url}:`, error);
    return {
      url,
      action,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Solicita a indexação de várias URLs de uma vez
 */
export async function indexMultipleUrls(urls: string[], action: IndexingAction = 'URL_UPDATED'): Promise<IndexingResult[]> {
  const results: IndexingResult[] = [];

  // Processa as URLs sequencialmente para evitar esgotar a cota
  for (const url of urls) {
    try {
      const result = await indexUrl(url, action);
      results.push(result);
      
      // Pequena pausa para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[GoogleIndexing] Erro ao processar URL ${url}:`, error);
      results.push({
        url,
        action,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}

/**
 * Obtém URLs dos últimos artigos publicados para indexação
 */
export async function getLatestArticleUrls(limit: number = 10): Promise<string[]> {
  try {
    // Importar o prisma apenas quando necessário para evitar problemas de SSR
    const { prisma } = await import('@/lib/prisma');
    
    // Buscar os artigos mais recentes
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
      select: {
        slug: true,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madua.com.br';
    
    // Formatar as URLs completas
    return articles.map(article => `${baseUrl}/noticias/${article.slug}`);
  } catch (error) {
    console.error('[GoogleIndexing] Erro ao obter URLs de artigos recentes:', error);
    return [];
  }
} 