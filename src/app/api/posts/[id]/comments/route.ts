import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma/client";

// GET - Obter comentários de um post
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Usar await para acessar params.id
    const { id } = await Promise.resolve(params);
    
    const comments = await prisma.comment.findMany({
      where: {
        postId: id,
      },
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
    });
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar comentários" },
      { status: 500 }
    );
  }
}

// POST - Adicionar um comentário a um post
export async function POST(
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
    
    // Validar dados obrigatórios
    if (!body.content) {
      return NextResponse.json(
        { error: "O conteúdo do comentário é obrigatório" },
        { status: 400 }
      );
    }
    
    // Verificar se o post existe
    const post = await prisma.post.findUnique({
      where: {
        id,
      },
    });
    
    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }
    
    // Criar o comentário
    const comment = await prisma.comment.create({
      data: {
        content: body.content,
        author: {
          connect: {
            id: userId,
          },
        },
        post: {
          connect: {
            id,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar comentário:", error);
    return NextResponse.json(
      { error: "Erro ao criar comentário" },
      { status: 500 }
    );
  }
} 