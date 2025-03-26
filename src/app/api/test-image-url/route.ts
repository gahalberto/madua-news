import { NextResponse } from 'next/server';

// Função para verificar se uma URL é acessível
async function isUrlAccessible(url: string): Promise<{
  isAccessible: boolean;
  contentType?: string;
  statusCode?: number;
  error?: string;
  headers?: Record<string, string>;
  urlTested: string;
}> {
  try {
    console.log(`Testando acessibilidade da URL: ${url}`);
    
    // Tentar acessar a URL
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 URL Validator',
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache'
      }
    });
    
    const contentType = response.headers.get('content-type') || '';
    const isImage = contentType.startsWith('image/');
    
    // Extrair headers relevantes para diagnóstico
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    console.log(`Resposta do teste de URL: status=${response.status}, contentType=${contentType}, isImage=${isImage}`);
    
    return {
      isAccessible: response.ok && isImage,
      contentType,
      statusCode: response.status,
      headers,
      urlTested: url
    };
  } catch (error) {
    console.error('Erro ao verificar URL:', error);
    return {
      isAccessible: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      urlTested: url
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL é obrigatória' },
        { status: 400 }
      );
    }

    console.log('Testando URL:', url);
    const result = await isUrlAccessible(url);
    
    // Se a URL não é acessível, tentar fornecer mais informações sobre o problema
    if (!result.isAccessible) {
      if (result.contentType) {
        console.log(`URL não é uma imagem válida. Content-Type: ${result.contentType}`);
      }
      
      if (result.statusCode && result.statusCode !== 200) {
        // Tente recuperar o conteúdo para diagnóstico se for um erro HTTP
        try {
          const errorContent = await fetch(url).then(r => r.text()).catch(() => 'Não foi possível obter o conteúdo');
          console.log(`Erro HTTP ${result.statusCode}. Conteúdo parcial: ${errorContent.substring(0, 200)}`);
          
          if (errorContent.length > 0) {
            result.error = `${result.error || ''} Conteúdo parcial: ${errorContent.substring(0, 200)}`;
          }
        } catch (fetchError) {
          console.error('Erro ao tentar obter conteúdo de diagnóstico:', fetchError);
        }
      }
    }
    
    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro ao testar URL:', error);
    return NextResponse.json(
      { error: 'Erro ao testar URL', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
} 