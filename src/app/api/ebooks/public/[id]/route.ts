import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Obter um e-book específico por ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Aguardar os parâmetros antes de usar suas propriedades
    const { id } = params;
    
    // Buscar e-book no banco de dados
    const ebook = await prisma.ebook.findUnique({
      where: { 
        id,
        isPublished: true // Apenas e-books publicados
      }
    });
    
    if (!ebook) {
      return NextResponse.json(
        { error: "E-book não encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(ebook);
  } catch (error) {
    console.error("Erro ao buscar e-book:", error);
    return NextResponse.json(
      { error: "Erro ao buscar e-book" },
      { status: 500 }
    );
  }
} 