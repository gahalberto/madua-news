import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;

    // Incrementa o contador de visualizações
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        views: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ views: updatedPost.views });
  } catch (error) {
    console.error("Erro ao registrar visualização:", error);
    return NextResponse.json(
      { error: "Erro ao registrar visualização" },
      { status: 500 }
    );
  }
} 