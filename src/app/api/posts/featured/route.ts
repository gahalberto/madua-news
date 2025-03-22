import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const featuredPost = await prisma.post.findFirst({
      where: {
        published: true,
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        imageUrl: true,
        slug: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const recentPosts = await prisma.post.findMany({
      where: {
        published: true,
        NOT: {
          id: featuredPost?.id,
        },
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        imageUrl: true,
        slug: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 9,
    });

    return NextResponse.json({
      featuredPost,
      recentPosts,
    });
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar posts' },
      { status: 500 }
    );
  }
} 