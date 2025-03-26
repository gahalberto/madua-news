import { NextResponse } from 'next/server';

// Função para verificar se uma URL é acessível
async function isUrlAccessible(url: string): Promise<{
  isAccessible: boolean;
  contentType?: string;
  statusCode?: number;
  error?: string;
}> {
  try {
    // Tentar acessar a URL
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 URL Validator',
        'Cache-Control': 'no-cache, no-store'
      }
    });
    
    const contentType = response.headers.get('content-type') || '';
    const isImage = contentType.startsWith('image/');
    
    return {
      isAccessible: response.ok && isImage,
      contentType,
      statusCode: response.status
    };
  } catch (error) {
    console.error('Erro ao verificar URL:', error);
    return {
      isAccessible: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
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

    const result = await isUrlAccessible(url);
    
    return NextResponse.json({
      url,
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