import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Interface para os dados do lead
interface LeadData {
  name: string;
  email: string;
  phone?: string;
  ebookId: string;
  ebookTitle: string;
}

// POST - Adicionar um novo lead
export async function POST(req: NextRequest) {
  try {
    // Obter dados do corpo da requisição
    const data: LeadData = await req.json();
    
    // Validar campos obrigatórios
    if (!data.name || !data.email || !data.ebookId) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }
    
    // Verificar se o e-book existe e é gratuito
    const ebook = await prisma.ebook.findUnique({
      where: { 
        id: data.ebookId,
        isPublished: true,
        price: 0
      }
    });
    
    if (!ebook) {
      return NextResponse.json(
        { error: "E-book não encontrado ou não é gratuito" },
        { status: 404 }
      );
    }
    
    // Criar lead no banco de dados
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: "ebook_download",
        ebookId: data.ebookId,
        ebookTitle: data.ebookTitle || ebook.title
      }
    });
    
    // Registrar o download do e-book
    await prisma.ebookDownload.create({
      data: {
        ebookId: data.ebookId,
        leadId: lead.id
      }
    });
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Erro ao capturar lead:", error);
    return NextResponse.json(
      { error: "Erro ao processar sua solicitação" },
      { status: 500 }
    );
  }
} 