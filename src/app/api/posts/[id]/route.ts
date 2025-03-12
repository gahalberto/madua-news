import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma/client";

// GET - Obter um post específico
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Usar await para acessar params.id
    const { id } = await Promise.resolve(params);
    
    const post = await prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    
    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error("Erro ao buscar post:", error);
    return NextResponse.json(
      { error: "Erro ao buscar post" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar um post
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar se o usuário está autenticado
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    // Usar await para acessar params.id
    const { id } = await Promise.resolve(params);
    const body = await req.json();
    
    // Verificar se o post existe e pertence ao usuário
    const existingPost = await prisma.post.findUnique({
      where: {
        id,
      },
    });
    
    if (!existingPost) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário é o autor do post ou um administrador
    if (existingPost.authorId !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado a editar este post" },
        { status: 403 }
      );
    }
    
    // Atualizar o post
    const updatedPost = await prisma.post.update({
      where: {
        id,
      },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        content: body.content !== undefined ? body.content : undefined,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : undefined,
        published: body.published !== undefined ? body.published : undefined,
        excerpt: body.excerpt !== undefined ? body.excerpt : undefined,
        metaTitle: body.metaTitle !== undefined ? body.metaTitle : undefined,
        metaDescription: body.metaDescription !== undefined ? body.metaDescription : undefined,
        categoryId: body.categoryId !== undefined ? body.categoryId : undefined,
      },
    });
    
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Erro ao atualizar post:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar post" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir um post
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar se o usuário está autenticado
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    // Usar await para acessar params.id
    const { id } = await Promise.resolve(params);
    
    // Verificar se o post existe e pertence ao usuário
    const existingPost = await prisma.post.findUnique({
      where: {
        id,
      },
    });
    
    if (!existingPost) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário é o autor do post ou um administrador
    if (existingPost.authorId !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado a excluir este post" },
        { status: 403 }
      );
    }
    
    // Excluir o post (isso também excluirá os comentários relacionados devido à cascata)
    await prisma.post.delete({
      where: {
        id,
      },
    });
    
    return NextResponse.json(
      { message: "Post excluído com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir post:", error);
    return NextResponse.json(
      { error: "Erro ao excluir post" },
      { status: 500 }
    );
  }
} 