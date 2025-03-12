import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    // Verificar se o usuário está autenticado
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    // Obter o ID da sessão do Stripe da query
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    
    if (!sessionId) {
      return NextResponse.json(
        { error: "ID da sessão não fornecido" },
        { status: 400 }
      );
    }
    
    // Buscar a sessão no Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!stripeSession) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      );
    }
    
    // Verificar se a sessão pertence ao usuário atual
    if (stripeSession.metadata?.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Acesso não autorizado a esta sessão" },
        { status: 403 }
      );
    }
    
    // Buscar o pedido associado à sessão
    const order = await prisma.order.findFirst({
      where: {
        id: stripeSession.client_reference_id as string,
        userId: session.user.id
      },
      include: {
        orderItems: true
      }
    });
    
    if (!order) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }
    
    // Atualizar o status do pedido para PAID se o pagamento foi bem-sucedido
    if (stripeSession.payment_status === "paid" && order.status !== "PAID") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID" }
      });
      
      // Atualizar o objeto order para refletir a mudança
      order.status = "PAID";
    }
    
    // Limpar o carrinho após verificar um pagamento bem-sucedido
    if (stripeSession.payment_status === "paid") {
      // Não podemos limpar o localStorage do servidor, isso deve ser feito no cliente
    }
    
    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: order.status,
      total: order.total,
      items: order.orderItems.map(item => ({
        id: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        type: item.productType.toLowerCase() === 'course' ? 'course' : 'ebook'
      })),
      paymentStatus: stripeSession.payment_status
    });
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    return NextResponse.json(
      { error: "Erro ao verificar sessão" },
      { status: 500 }
    );
  }
} 