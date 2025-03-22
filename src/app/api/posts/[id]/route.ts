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
    
    console.log("[DEBUG] Atualizando post com ID:", id);
    console.log("[DEBUG] Dados recebidos:", JSON.stringify({
      title: body.title,
      contentLength: body.content?.length || 0,
      imageUrl: body.imageUrl,
      published: body.published,
      categoryId: body.categoryId
    }));
    
    // Verificar se o post existe e pertence ao usuário
    const existingPost = await prisma.post.findUnique({
      where: {
        id,
      },
    });
    
    if (!existingPost) {
      console.log("[DEBUG] Post não encontrado com ID:", id);
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário é o autor do post ou um administrador
    if (existingPost.authorId !== userId && session.user.role !== "ADMIN") {
      console.log("[DEBUG] Usuário não autorizado:", userId, "Post pertence a:", existingPost.authorId);
      return NextResponse.json(
        { error: "Não autorizado a editar este post" },
        { status: 403 }
      );
    }
    
    // Validar dados antes de atualizar
    if (body.title === '') {
      return NextResponse.json(
        { error: "O título não pode estar vazio" },
        { status: 400 }
      );
    }
    
    if (body.content === '') {
      return NextResponse.json(
        { error: "O conteúdo não pode estar vazio" },
        { status: 400 }
      );
    }
    
    const updateData = {
      title: body.title !== undefined ? body.title : undefined,
      content: body.content !== undefined ? body.content : undefined,
      slug: body.slug !== undefined ? body.slug : undefined,
      imageUrl: body.imageUrl !== undefined ? body.imageUrl : undefined,
      published: body.published !== undefined ? body.published : undefined,
      excerpt: body.excerpt !== undefined ? body.excerpt : undefined,
      metaTitle: body.metaTitle !== undefined ? body.metaTitle : undefined,
      metaDescription: body.metaDescription !== undefined ? body.metaDescription : undefined,
      categoryId: body.categoryId !== undefined ? (body.categoryId || null) : undefined,
    };
    
    console.log("[DEBUG] Dados de atualização:", JSON.stringify({
      ...updateData,
      contentLength: updateData.content?.length || 0
    }));
    
    // Atualizar o post
    try {
      const updatedPost = await prisma.post.update({
        where: {
          id,
        },
        data: updateData,
      });
      
      console.log("[DEBUG] Post atualizado com sucesso:", updatedPost.id);
      return NextResponse.json(updatedPost);
    } catch (dbError) {
      console.error("[DEBUG] Erro ao atualizar no banco de dados:", dbError);
      return NextResponse.json(
        { error: "Erro ao atualizar post no banco de dados" },
        { status: 500 }
      );
    }
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