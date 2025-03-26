import { NextResponse } from "next/server";
import { generatePostBanner } from "@/lib/imageGenerator";
import { PrismaClient } from "@prisma/client";
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// Imagem padrão para usar quando não há imagem no post
const DEFAULT_IMAGE_URL = "/images/default-post-image.jpg";

// Verificar se o arquivo existe
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const postId = searchParams.get('postId');

    console.log('Generate Banner API chamada com:', { title, postId });

    if (!title) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      );
    }

    // Se o postId for fornecido, tenta buscar a imagem do post
    let imageUrl = DEFAULT_IMAGE_URL;
    if (postId) {
      try {
        const post = await prisma.post.findUnique({
          where: { id: postId },
          select: { imageUrl: true }
        });
        
        console.log('Post encontrado:', post);
        
        if (post?.imageUrl) {
          imageUrl = post.imageUrl;
          console.log('Usando imagem do post:', imageUrl);
        } else {
          console.log('Post não tem imagem, usando imagem padrão');
        }
      } catch (error) {
        console.error('Erro ao buscar post:', error);
        // Continuar com a imagem padrão em caso de erro
      }
    }

    // Verificar se a imagem padrão existe quando necessário
    if (imageUrl === DEFAULT_IMAGE_URL) {
      const publicDir = path.join(process.cwd(), 'public');
      const defaultImagePath = path.join(publicDir, DEFAULT_IMAGE_URL.slice(1));
      
      const exists = await fileExists(defaultImagePath);
      if (!exists) {
        console.error(`Imagem padrão não encontrada em: ${defaultImagePath}`);
        // Usar uma imagem alternativa ou gerar um erro mais informativo
        return NextResponse.json(
          { error: "Imagem padrão não encontrada" },
          { status: 500 }
        );
      }
    }

    console.log('Chamando generatePostBanner com:', { title, imageUrl });

    // Gera o banner com a imagem do post ou a imagem padrão
    try {
      const bannerUrl = await generatePostBanner({ 
        title, 
        imageUrl
      });

      console.log('Banner gerado com sucesso:', bannerUrl);

      // Verificar se o banner foi gerado corretamente
      if (!bannerUrl) {
        throw new Error('URL do banner não foi gerada');
      }

      // Verificar se o arquivo do banner existe
      const bannerPath = path.join(process.cwd(), 'public', bannerUrl);
      const bannerExists = await fileExists(bannerPath);
      
      if (!bannerExists) {
        console.error(`Arquivo de banner não encontrado em: ${bannerPath}`);
        throw new Error('Arquivo de banner não foi criado corretamente');
      }

      // Redireciona para a URL do banner (URL absoluta)
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madua.com.br';
      const fullBannerUrl = `${baseUrl}${bannerUrl}`;
      console.log('Redirecionando para:', fullBannerUrl);
      
      return NextResponse.redirect(fullBannerUrl);
    } catch (error) {
      console.error('Erro ao gerar banner:', error);
      return NextResponse.json(
        { error: `Erro ao gerar banner: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro geral na API de geração de banner:", error);
    return NextResponse.json(
      { error: `Erro ao gerar banner: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
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

    console.log('POST generate-banner - Gerando banner com:', { title, imageUrlPreview: imageUrl.substring(0, 50) + '...' });

    try {
      const bannerUrl = await generatePostBanner({ title, imageUrl });
      console.log('Banner gerado com sucesso via POST:', bannerUrl);
      return NextResponse.json({ bannerUrl });
    } catch (error) {
      console.error('Erro ao gerar banner via POST:', error);
      return NextResponse.json(
        { error: `Erro detalhado: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro ao processar solicitação POST:", error);
    return NextResponse.json(
      { error: `Erro ao gerar banner: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
} 