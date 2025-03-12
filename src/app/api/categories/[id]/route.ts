import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma/client";

// GET - Obter uma categoria específica
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Usar await para acessar params.id
    const { id } = await Promise.resolve(params);
    
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            courses: true,
            posts: true,
          },
        },
      },
    });
    
    if (!category) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    return NextResponse.json(
      { error: "Erro ao buscar categoria" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar uma categoria
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar se o usuário está autenticado e é admin
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    // Usar await para acessar params.id
    const { id } = await Promise.resolve(params);
    const body = await req.json();
    
    // Validar dados obrigatórios
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Nome da categoria é obrigatório" },
        { status: 400 }
      );
    }
    
    // Verificar se a categoria existe
    const existingCategory = await prisma.category.findUnique({
      where: {
        id,
      },
    });
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }
    
    // Verificar se já existe outra categoria com o mesmo nome
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: body.name,
          mode: 'insensitive',
        },
        id: {
          not: id,
        },
      },
    });
    
    if (duplicateCategory) {
      return NextResponse.json(
        { error: "Já existe uma categoria com este nome" },
        { status: 400 }
      );
    }
    
    // Atualizar a categoria
    const updatedCategory = await prisma.category.update({
      where: {
        id,
      },
      data: {
        name: body.name.trim(),
      },
      include: {
        _count: {
          select: {
            courses: true,
            posts: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar categoria" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir uma categoria
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar se o usuário está autenticado e é admin
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    // Usar await para acessar params.id
    const { id } = await Promise.resolve(params);
    
    // Verificar se a categoria existe
    const existingCategory = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            courses: true,
            posts: true,
          },
        },
      },
    });
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }
    
    // Verificar se a categoria está sendo usada em cursos
    if (existingCategory._count.courses > 0 || existingCategory._count.posts > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir uma categoria que está sendo usada em cursos ou posts" },
        { status: 400 }
      );
    }
    
    // Excluir a categoria
    await prisma.category.delete({
      where: {
        id,
      },
    });
    
    return NextResponse.json(
      { message: "Categoria excluída com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return NextResponse.json(
      { error: "Erro ao excluir categoria" },
      { status: 500 }
    );
  }
} 