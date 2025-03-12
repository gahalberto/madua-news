import { NextRequest, NextResponse } from "next/server";
import { Preference } from "mercadopago";
import mpClient from "@/app/_lib/mercado-pago";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface CartItem {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Você precisa estar logado para fazer uma compra" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { items } = body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Nenhum item foi enviado" },
        { status: 400 }
      );
    }
    
    // Obter informações completas do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }
    
    const preference = new Preference(mpClient);
    
    // URL base para redirecionamento
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    
    const preferenceData = await preference.create({
      body: {
        items: items.map((item: CartItem) => ({
          id: item.id,
          title: item.title,
          quantity: 1,
          unit_price: item.price,
          currency_id: "BRL",
        })),
        back_urls: {
          success: `${baseUrl}/checkout/success`,
          failure: `${baseUrl}/checkout/failure`,
          pending: `${baseUrl}/checkout/pending`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/mercadopago-webhook`,
        // Adicionar informações do usuário
        payer: {
          name: user.name || "Usuário",
          email: user.email || "email@exemplo.com"
        },
        metadata: {
          userId: user.id,
          userName: user.name,
          userEmail: user.email
        }
      }
    });
    
    return NextResponse.json({ 
      preferenceId: preferenceData.id,
      init_point: preferenceData.init_point
    });
  } catch (error) {
    console.error("Erro ao criar preferência de pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao processar o pagamento" },
      { status: 500 }
    );
  }
} 