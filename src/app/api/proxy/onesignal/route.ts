import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy para o OneSignal em ambiente de desenvolvimento
 * 
 * Esta rota de API serve como um proxy para contornar as restrições de CORS
 * ao carregar scripts e recursos do OneSignal em ambiente de desenvolvimento local.
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');
    
    if (!path) {
      return NextResponse.json({ error: 'Path não especificado' }, { status: 400 });
    }
    
    const fullUrl = `https://cdn.onesignal.com${path}`;
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('user-agent') || '',
      },
    });
    
    const contentType = response.headers.get('content-type') || 'application/javascript';
    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Erro no proxy do OneSignal:', error);
    return NextResponse.json(
      { error: 'Erro interno ao acessar recursos do OneSignal' },
      { status: 500 }
    );
  }
} 