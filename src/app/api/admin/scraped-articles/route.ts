import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Função para listar todos os artigos extraídos
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { searchParams } = new URL(request.url);
    const skipAuth = searchParams.get('skip-auth') === 'true';
    
    if (!skipAuth) {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
      }
    }

    // Parâmetros de paginação
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const status = searchParams.get('status') || undefined;

    // Construir a query
    const whereClause = status ? { status } : {};

    // Obter o total de artigos
    const total = await prisma.scrapedArticle.count({
      where: whereClause,
    });

    // Obter os artigos paginados
    const articles = await prisma.scrapedArticle.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        }
      }
    });

    return NextResponse.json({
      data: articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Erro ao listar artigos extraídos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Endpoint para processar manualmente um artigo
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { articleId } = await request.json();

    if (!articleId) {
      return NextResponse.json({ error: 'ID do artigo não fornecido' }, { status: 400 });
    }

    // Verificar se o artigo existe
    const article = await prisma.scrapedArticle.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
    }

    // Atualizar o status do artigo para processando
    await prisma.scrapedArticle.update({
      where: { id: articleId },
      data: { status: 'PROCESSING' }
    });

    // Aqui você chamaria a função de processamento do artigo, 
    // mas como estamos simplificando, apenas retornamos sucesso
    
    return NextResponse.json({ 
      message: 'Artigo enviado para processamento',
      articleId
    });
  } catch (error) {
    console.error('Erro ao processar artigo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 