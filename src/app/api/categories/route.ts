import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma/client";

// GET - Listar todas as categorias
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            courses: true,
            // Adicionar contagem de posts quando a relação for implementada
            // posts: true,
          },
        },
      },
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json(
      { error: "Erro ao buscar categorias" },
      { status: 500 }
    );
  }
}

// POST - Criar uma nova categoria
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar se o usuário está autenticado e é admin
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validar dados obrigatórios
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Nome da categoria é obrigatório" },
        { status: 400 }
      );
    }
    
    // Verificar se já existe uma categoria com o mesmo nome
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: body.name,
          mode: 'insensitive',
        },
      },
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: "Já existe uma categoria com este nome" },
        { status: 400 }
      );
    }
    
    // Criar a categoria
    const category = await prisma.category.create({
      data: {
        name: body.name.trim(),
      },
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json(
      { error: "Erro ao criar categoria" },
      { status: 500 }
    );
  }
} 