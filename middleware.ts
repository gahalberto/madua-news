import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Não faz nada, apenas garante que o Next.js saiba que este é um middleware
  return NextResponse.next();
}

// Configurar o matcher para incluir apenas rotas de API
export const config = {
  matcher: ['/api/:path*'],
}; 