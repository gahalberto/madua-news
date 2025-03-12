import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Interface para os dados do e-book
interface EbookData {
  id?: string;
  title: string;
  description: string;
  price: number | string;
  promotionalPrice?: number | string | null;
  coverImageUrl?: string | null;
  fileUrl: string;
  pages?: number | string | null;
  language?: string | null;
  isbn?: string | null;
  author?: string | null;
  publisher?: string | null;
  publicationDate?: string | null;
  format?: string | null;
  featured?: boolean;
  isPublished?: boolean;
  categoryId?: string | null;
}

// GET - Listar todos os e-books
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar se o usuário está autenticado e é admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Obter parâmetros de consulta
    const url = new URL(req.url);
    const searchTerm = url.searchParams.get("search") || "";
    const filter = url.searchParams.get("filter") || "all";
    
    // Construir a consulta
    const whereClause: {
      OR?: Array<{[key: string]: {[key: string]: string, mode: string}}>;
      isPublished?: boolean;
      featured?: boolean;
    } = {};
    
    // Adicionar filtro de busca
    if (searchTerm) {
      whereClause.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { author: { contains: searchTerm, mode: "insensitive" } }
      ];
    }
    
    // Adicionar filtro de status
    if (filter === "published") {
      whereClause.isPublished = true;
    } else if (filter === "draft") {
      whereClause.isPublished = false;
    } else if (filter === "featured") {
      whereClause.featured = true;
    }
    
    // Buscar e-books no banco de dados
    const ebooks = await prisma.ebook.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" }
    });
    
    return NextResponse.json(ebooks);
  } catch (error) {
    console.error("Erro ao buscar e-books:", error);
    return NextResponse.json(
      { error: "Erro ao buscar e-books" },
      { status: 500 }
    );
  }
}

// POST - Adicionar um novo e-book
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar se o usuário está autenticado e é admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    // Obter dados do corpo da requisição
    const data = await req.json() as EbookData;
    
    // Validar campos obrigatórios
    if (!data.title || !data.description || data.price === undefined || data.price === null || !data.fileUrl) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }
    
    // Criar e-book no banco de dados
    const ebook = await prisma.ebook.create({
      data: {
        title: data.title,
        description: data.description,
        price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
        promotionalPrice: data.promotionalPrice ? (typeof data.promotionalPrice === 'string' ? parseFloat(data.promotionalPrice) : data.promotionalPrice) : null,
        coverImageUrl: data.coverImageUrl,
        fileUrl: data.fileUrl,
        pages: data.pages ? (typeof data.pages === 'string' ? parseInt(data.pages) : data.pages) : null,
        language: data.language,
        isbn: data.isbn,
        author: data.author,
        publisher: data.publisher,
        publicationDate: data.publicationDate ? new Date(data.publicationDate) : null,
        format: data.format,
        featured: data.featured || false,
        isPublished: data.isPublished || false,
        categoryId: data.categoryId
      }
    });
    
    return NextResponse.json(ebook, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar e-book:", error);
    return NextResponse.json(
      { error: "Erro ao criar e-book" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar um e-book existente
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar se o usuário está autenticado e é admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    // Obter dados do corpo da requisição
    const data = await req.json() as EbookData;
    
    // Validar campos obrigatórios
    if (!data.id || !data.title || !data.description || data.price === undefined || data.price === null) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }
    
    // Verificar se o e-book existe
    const existingEbook = await prisma.ebook.findUnique({
      where: { id: data.id }
    });
    
    if (!existingEbook) {
      return NextResponse.json(
        { error: "E-book não encontrado" },
        { status: 404 }
      );
    }
    
    // Atualizar e-book no banco de dados
    const ebook = await prisma.ebook.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
        promotionalPrice: data.promotionalPrice ? (typeof data.promotionalPrice === 'string' ? parseFloat(data.promotionalPrice) : data.promotionalPrice) : null,
        coverImageUrl: data.coverImageUrl,
        fileUrl: data.fileUrl,
        pages: data.pages ? (typeof data.pages === 'string' ? parseInt(data.pages) : data.pages) : null,
        language: data.language,
        isbn: data.isbn,
        author: data.author,
        publisher: data.publisher,
        publicationDate: data.publicationDate ? new Date(data.publicationDate) : null,
        format: data.format,
        featured: data.featured || false,
        isPublished: data.isPublished || false,
        categoryId: data.categoryId
      }
    });
    
    return NextResponse.json(ebook);
  } catch (error) {
    console.error("Erro ao atualizar e-book:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar e-book" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir um e-book
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar se o usuário está autenticado e é admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    // Obter ID do e-book da URL
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "ID do e-book não fornecido" },
        { status: 400 }
      );
    }
    
    // Verificar se o e-book existe
    const existingEbook = await prisma.ebook.findUnique({
      where: { id }
    });
    
    if (!existingEbook) {
      return NextResponse.json(
        { error: "E-book não encontrado" },
        { status: 404 }
      );
    }
    
    // Excluir e-book do banco de dados
    await prisma.ebook.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir e-book:", error);
    return NextResponse.json(
      { error: "Erro ao excluir e-book" },
      { status: 500 }
    );
  }
} 