import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const featuredEbooks = await prisma.ebook.findMany({
      where: {
        isPublished: true,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 4,
    });

    return NextResponse.json(featuredEbooks);
  } catch (error) {
    console.error('Erro ao buscar e-books:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar e-books' },
      { status: 500 }
    );
  }
} 