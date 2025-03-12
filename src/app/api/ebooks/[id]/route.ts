import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Obter um e-book específico por ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar se o usuário está autenticado e é admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const id = params.id;
    
    // Buscar e-book no banco de dados
    const ebook = await prisma.ebook.findUnique({
      where: { id }
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