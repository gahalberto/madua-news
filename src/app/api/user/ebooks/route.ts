import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Verificar se o usuário está autenticado
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Buscar os pedidos do usuário que foram pagos
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: "PAID"
      },
      include: {
        orderItems: {
          where: {
            productType: "EBOOK"
          },
          include: {
            Ebook: true
          }
        }
      }
    });

    // Extrair os e-books dos pedidos
    const ebookItems = orders.flatMap(order => order.orderItems);
    
    // Criar um mapa para evitar duplicatas (caso o usuário tenha comprado o mesmo e-book várias vezes)
    const ebookMap = new Map();
    
    // Processar os itens de pedido para obter informações dos e-books
    for (const item of ebookItems) {
      if (item.Ebook && !ebookMap.has(item.Ebook.id)) {
        ebookMap.set(item.Ebook.id, {
          id: item.Ebook.id,
          title: item.title || item.Ebook.title,
          description: item.Ebook.description,
          coverImageUrl: item.Ebook.coverImageUrl || null,
          fileUrl: item.Ebook.fileUrl,
          author: item.Ebook.author || "Autor não especificado",
          purchaseDate: new Intl.DateTimeFormat('pt-BR').format(new Date(item.createdAt))
        });
      }
    }
    
    // Converter o mapa para um array
    const userEbooks = Array.from(ebookMap.values());

    return NextResponse.json(userEbooks);
  } catch (error) {
    console.error("Erro ao buscar e-books do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar e-books" },
      { status: 500 }
    );
  }
} 