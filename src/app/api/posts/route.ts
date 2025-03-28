import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma/client";
import { generatePostBannerAndGetUrl } from "@/lib/postUtils";

// Definir tipos para os filtros
type PostFilter = {
  published?: boolean;
  authorId?: string;
};

// Imagem padrão para posts
const DEFAULT_POST_IMAGE = "https://madua.com.br/blog-images/34df77b2-4a8a-43c7-9bdf-59ad8b9f6bd6.jpg";

// GET - Listar todos os posts
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const published = searchParams.get("published");
    const authorId = searchParams.get("authorId");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    
    // Construir o filtro com base nos parâmetros
    const filter: PostFilter = {};
    
    if (published === "true") {
      filter.published = true;
    } else if (published === "false") {
      filter.published = false;
    }
    
    if (authorId) {
      filter.authorId = authorId;
    }
    
    // Buscar posts com contagem de comentários
    const posts = await prisma.post.findMany({
      where: filter,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
    
    // Formatar a resposta
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      published: post.published,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      commentsCount: post._count.comments,
    }));
    
    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return NextResponse.json(
      { error: "Erro ao buscar posts" },
      { status: 500 }
    );
  }
}

// POST - Criar um novo post
export async function POST(req: Request) {
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
    const body = await req.json();
    
    // Validar dados obrigatórios
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios" },
        { status: 400 }
      );
    }

    // Gerar o banner para o post
    const imageUrl = body.imageUrl || DEFAULT_POST_IMAGE;
    let bannerUrl = null;
    
    try {
      console.log('Gerando banner para novo post', { title: body.title });
      bannerUrl = await generatePostBannerAndGetUrl(imageUrl, body.title);
    } catch (bannerError) {
      console.error('Erro ao gerar banner para novo post:', bannerError);
      // Continua com a criação do post mesmo sem banner
    }
    
    // Criar o post
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        excerpt: body.excerpt,
        slug: body.slug,
        imageUrl: imageUrl,
        bannerUrl: bannerUrl,
        published: body.published || false,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        categoryId: body.categoryId,
        author: {
          connect: {
            id: userId,
          },
        },
      },
    });
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar post:", error);
    return NextResponse.json(
      { error: "Erro ao criar post" },
      { status: 500 }
    );
  }
} 