import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madua.com.br';

/**
 * GET /api/urls
 * 
 * Parâmetros opcionais:
 * - tipo: Filtra por tipo de conteúdo (cursos, ebooks, produtos, posts)
 * - limite: Número máximo de itens a retornar
 * 
 * Exemplo: /api/urls?tipo=posts&limite=10
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tipo = searchParams.get('tipo');
  const limite = parseInt(searchParams.get('limite') || '0');

  try {
    let response: Record<string, string[]> = {};

    // Buscar cursos (se não especificado tipo ou tipo=cursos)
    if (!tipo || tipo === 'cursos') {
      const cursos = await prisma.course.findMany({
        where: {
          isPublished: true,
        },
        select: {
          slug: true,
        },
        ...(limite > 0 ? { take: limite } : {}),
      });
      response.cursos = cursos.map((curso) => `${siteUrl}/cursos/${curso.slug}`);
    }

    // Buscar ebooks (se não especificado tipo ou tipo=ebooks)
    if (!tipo || tipo === 'ebooks') {
      const ebooks = await prisma.ebook.findMany({
        where: {
          isPublished: true,
        },
        select: {
          id: true,
        },
        ...(limite > 0 ? { take: limite } : {}),
      });
      response.ebooks = ebooks.map((ebook) => `${siteUrl}/ebooks/${ebook.id}`);
    }

    // Buscar produtos (se não especificado tipo ou tipo=produtos)
    if (!tipo || tipo === 'produtos') {
      const produtos = await prisma.product.findMany({
        select: {
          id: true,
        },
        ...(limite > 0 ? { take: limite } : {}),
      });
      response.produtos = produtos.map((produto) => `${siteUrl}/produtos/${produto.id}`);
    }

    // Buscar posts (se não especificado tipo ou tipo=posts)
    if (!tipo || tipo === 'posts') {
      const posts = await prisma.post.findMany({
        where: {
          published: true,
        },
        select: {
          slug: true,
        },
        ...(limite > 0 ? { take: limite } : {}),
      });
      response.posts = posts.map((post) => `${siteUrl}/posts/${post.slug}`);
    }

    // Retornar estatísticas adicionais
    const totalDeUrls = Object.values(response).reduce(
      (total, urls) => total + urls.length,
      0
    );

    return NextResponse.json({
      ...response,
      meta: {
        total: totalDeUrls,
        filtro: tipo || 'todos',
        limite: limite || 'sem limite',
        basePath: siteUrl,
      }
    });
  } catch (error) {
    console.error('Erro ao buscar URLs:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar URLs de conteúdo' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
