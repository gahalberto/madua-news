import { NextResponse } from "next/server";
import { generatePostBanner } from "@/lib/imageGenerator";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Imagem padrão para usar quando não há imagem no post
const DEFAULT_IMAGE_URL = "/images/default-post-image.jpg";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const postId = searchParams.get('postId');

    if (!title) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }

    // Se o postId for fornecido, tenta buscar a imagem do post
    let imageUrl = DEFAULT_IMAGE_URL;
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { imageUrl: true }
      });
      
      if (post?.imageUrl) {
        imageUrl = post.imageUrl;
      }
    }

    // Gera o banner com a imagem do post ou a imagem padrão
    const bannerUrl = await generatePostBanner({ 
      title, 
      imageUrl
    });

    // Redireciona para a URL do banner
    return NextResponse.redirect(bannerUrl);
  } catch (error) {
    console.error("Erro ao gerar banner via GET:", error);
    return NextResponse.json(
      { error: "Erro ao gerar banner" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, imageUrl } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Título e URL da imagem são obrigatórios" },
        { status: 400 }
      );
    }

    const bannerUrl = await generatePostBanner({ title, imageUrl });

    return NextResponse.json({ bannerUrl });
  } catch (error) {
    console.error("Erro ao gerar banner:", error);
    return NextResponse.json(
      { error: "Erro ao gerar banner" },
      { status: 500 }
    );
  }
} 