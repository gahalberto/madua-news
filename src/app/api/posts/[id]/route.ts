import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma/client";
import { generatePostBannerAndGetUrl } from "@/lib/postUtils";

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

// Imagem padrão para posts
const DEFAULT_POST_IMAGE = "https://madua.com.br/blog-images/34df77b2-4a8a-43c7-9bdf-59ad8b9f6bd6.jpg";

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
    
    const body = await req.json();
    
    // Validar dados obrigatórios
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se precisa gerar um novo banner
    let bannerUrl = null;
    const imageUrl = body.imageUrl || DEFAULT_POST_IMAGE;

    // Se há uma imagem nova ou uma alteração no título, gerar novo banner
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
      select: { title: true, imageUrl: true }
    });

    const titleChanged = existingPost?.title !== body.title;
    const imageChanged = existingPost?.imageUrl !== imageUrl;

    if (titleChanged || imageChanged) {
      console.log('Gerando novo banner para o post', { 
        postId: params.id, 
        titleChanged, 
        imageChanged 
      });
      bannerUrl = await generatePostBannerAndGetUrl(imageUrl, body.title);
    }
    
    // Atualizar o post
    const post = await prisma.post.update({
      where: {
        id: params.id,
      },
      data: {
        title: body.title,
        content: body.content,
        excerpt: body.excerpt,
        slug: body.slug,
        imageUrl: imageUrl,
        published: body.published,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        categoryId: body.categoryId,
        // Atualizar bannerUrl se tiver um novo, ou manter o existente
        ...(bannerUrl && { bannerUrl }),
      },
    });
    
    return NextResponse.json(post);
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
    
    // Excluir o post
    await prisma.post.delete({
      where: {
        id: params.id,
      },
    });
    
    return NextResponse.json({ message: "Post excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir post:", error);
    return NextResponse.json(
      { error: "Erro ao excluir post" },
      { status: 500 }
    );
  }
} 