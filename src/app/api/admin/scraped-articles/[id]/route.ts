import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Buscar um artigo específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o usuário está autenticado e é admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const id = params.id;
    
    // Buscar o artigo por ID
    const article = await prisma.scrapedArticle.findUnique({
      where: { id },
      include: {
        post: true,
      }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Erro ao buscar artigo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar artigo' },
      { status: 500 }
    );
  }
}

// Excluir um artigo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o usuário está autenticado e é admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const id = params.id;
    
    // Verificar se o artigo existe
    const article = await prisma.scrapedArticle.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    // Excluir o artigo
    await prisma.scrapedArticle.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Artigo excluído com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir artigo:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir artigo' },
      { status: 500 }
    );
  }
} 