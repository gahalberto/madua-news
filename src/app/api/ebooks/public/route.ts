import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Listar todos os e-books públicos
export async function GET(req: NextRequest) {
  try {
    // Obter parâmetros de consulta
    const url = new URL(req.url);
    const searchTerm = url.searchParams.get("search") || "";
    const filter = url.searchParams.get("filter") || "all";
    
    // Construir a consulta
    const whereClause: {
      OR?: Array<{[key: string]: {[key: string]: string, mode: string}}>;
      isPublished: boolean;
      featured?: boolean;
      price?: any;
    } = {
      // Apenas e-books publicados
      isPublished: true
    };
    
    // Adicionar filtro de busca
    if (searchTerm) {
      whereClause.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { author: { contains: searchTerm, mode: "insensitive" } }
      ];
    }
    
    // Adicionar filtro de categoria
    if (filter === "featured") {
      whereClause.featured = true;
    } else if (filter === "free") {
      whereClause.price = 0;
    } else if (filter === "paid") {
      whereClause.price = { gt: 0 };
    }
    
    // Buscar e-books no banco de dados
    const ebooks = await prisma.ebook.findMany({
      where: whereClause,
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" }
      ],
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        promotionalPrice: true,
        coverImageUrl: true,
        author: true,
        publisher: true,
        language: true,
        pages: true,
        format: true,
        featured: true,
        isPublished: true,
        createdAt: true
      }
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