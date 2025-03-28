import { NextRequest, NextResponse } from 'next/server';
import { indexMultipleUrls, getLatestArticleUrls } from '../../../lib/googleIndexing';

/**
 * API para solicitar a indexação de URLs no Google
 * 
 * POST: Inicia a indexação de URLs recentes ou URLs específicas fornecidas no corpo da requisição
 * Este endpoint pode ser protegido por uma chave API para maior segurança
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar a chave de API para maior segurança
    const apiKey = process.env.INDEXING_API_KEY;
    const requestKey = request.headers.get('x-api-key');
    
    if (apiKey && requestKey !== apiKey) {
      return NextResponse.json(
        { error: 'Chave de API inválida' },
        { status: 401 }
      );
    }

    // Obter dados da requisição
    const body = await request.json().catch(() => ({}));
    
    // Se URLs específicas foram fornecidas, use-as
    // Caso contrário, busque URLs de artigos recentes
    let urls: string[] = [];
    
    if (body.urls && Array.isArray(body.urls) && body.urls.length > 0) {
      urls = body.urls;
      console.log(`[GoogleIndexing] Processando ${urls.length} URLs fornecidas manualmente`);
    } else {
      // O número de URLs a buscar pode ser especificado no corpo da requisição
      const limit = body.limit && typeof body.limit === 'number' ? body.limit : 10;
      console.log(`[GoogleIndexing] Buscando até ${limit} URLs recentes para indexação`);
      urls = await getLatestArticleUrls(limit);
    }
    
    if (urls.length === 0) {
      console.log('[GoogleIndexing] Nenhuma URL encontrada para indexação');
      return NextResponse.json({
        success: false,
        message: 'Nenhuma URL disponível para indexação',
      });
    }
    
    // Filtrar URLs locais (localhost) que não podem ser indexadas pelo Google
    const urlsOriginais = [...urls];
    urls = urls.filter(url => !url.includes('localhost') && !url.includes('127.0.0.1'));

    if (urls.length < urlsOriginais.length) {
      console.log(`[GoogleIndexing] ${urlsOriginais.length - urls.length} URLs locais foram removidas e não serão indexadas`);
    }

    if (urls.length === 0) {
      console.log('[GoogleIndexing] Todas as URLs eram locais, nada para indexar');
      return NextResponse.json({
        success: false,
        message: 'Nenhuma URL válida disponível para indexação (todas eram URLs locais)',
      });
    }
    
    // Iniciar processo de indexação
    console.log(`[GoogleIndexing] Iniciando indexação de ${urls.length} URLs com ação "${body.action || 'URL_UPDATED'}"`);
    const action = body.action === 'URL_DELETED' ? 'URL_DELETED' : 'URL_UPDATED';
    const results = await indexMultipleUrls(urls, action);
    
    // Calcular estatísticas
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    console.log(`[GoogleIndexing] Processo finalizado: ${successCount} URLs enviadas com sucesso, ${failureCount} falhas`);

    // Se houver falhas, registre-as em detalhes
    if (failureCount > 0) {
      results.filter(r => !r.success).forEach(result => {
        console.error(`[GoogleIndexing] Falha ao indexar URL ${result.url}: ${result.error}`);
      });
    }

    return NextResponse.json({
      success: true,
      message: `Processo de indexação concluído: ${successCount} URLs enviadas com sucesso, ${failureCount} falhas`,
      totalUrls: urls.length,
      successCount,
      failureCount,
      results,
    });
  } catch (error) {
    console.error('[API] Erro ao processar solicitação de indexação:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao processar solicitação de indexação',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Para permitir testar a API com uma requisição GET (não recomendado para produção)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar a chave de API para maior segurança
    const apiKey = process.env.INDEXING_API_KEY;
    const requestKey = request.headers.get('x-api-key');
    
    if (apiKey && requestKey !== apiKey) {
      return NextResponse.json(
        { error: 'Chave de API inválida' },
        { status: 401 }
      );
    }
    
    // Em produção, você pode querer desabilitar este método
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Método GET não disponível em produção, use POST' },
        { status: 405 }
      );
    }
    
    // Obter parâmetros da URL
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    
    // Buscar URLs de artigos recentes
    const urls = await getLatestArticleUrls(limit);
    
    if (urls.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhuma URL disponível para indexação',
      });
    }
    
    // Retornar apenas as URLs sem iniciar indexação
    return NextResponse.json({
      success: true,
      message: `Encontradas ${urls.length} URLs para potencial indexação`,
      urls,
    });
  } catch (error) {
    console.error('[API] Erro ao processar solicitação GET de indexação:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao processar solicitação',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
} 