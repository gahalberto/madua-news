import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";

export async function POST(req: NextRequest) {
  try {
    // Obter dados da requisição
    const data = await req.json();
    
    // Verificar se é uma notificação de pagamento
    if (data.type !== "payment") {
      return NextResponse.json({ message: "Notificação recebida" });
    }
    
    // Configurar o cliente do MercadoPago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN as string
    });
    
    const payment = new Payment(client);
    
    // Obter detalhes do pagamento
    const paymentData = await payment.get({ id: data.data.id });
    
    if (!paymentData) {
      throw new Error("Pagamento não encontrado");
    }
    
    // Obter a referência externa (ID do pedido)
    const orderId = paymentData.external_reference;
    
    if (!orderId) {
      throw new Error("Referência do pedido não encontrada");
    }
    
    // Obter metadados do usuário
    const metadata = paymentData.metadata || {};
    const userId = metadata.userId;
    const userName = metadata.userName;
    const userEmail = metadata.userEmail;
    
    // Registrar os dados do pagamento com informações do usuário
    await prisma.paymentLog.create({
      data: {
        paymentId: paymentData.id.toString(),
        orderId,
        status: paymentData.status,
        amount: paymentData.transaction_amount,
        paymentMethod: paymentData.payment_method_id,
        paymentType: paymentData.payment_type_id,
        userId: userId || null,
        userName: userName || null,
        userEmail: userEmail || null,
        rawData: JSON.stringify(paymentData)
      }
    });
    
    // Atualizar o status do pedido
    let orderStatus = "PENDING";
    
    if (paymentData.status === "approved") {
      orderStatus = "COMPLETED";
    } else if (paymentData.status === "rejected" || paymentData.status === "cancelled") {
      orderStatus = "FAILED";
    }
    
    await prisma.order.update({
      where: { id: orderId },
      data: { status: orderStatus }
    });
    
    // Se o pagamento foi aprovado, conceder acesso aos produtos
    if (paymentData.status === "approved") {
      // Buscar os itens do pedido
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId }
      });
      
      // Conceder acesso a cada item
      for (const item of orderItems) {
        if (item.productType === "COURSE") {
          // Conceder acesso ao curso
          await prisma.userCourse.upsert({
            where: {
              userId_courseId: {
                userId: userId,
                courseId: item.productId
              }
            },
            update: {
              hasAccess: true
            },
            create: {
              userId: userId,
              courseId: item.productId,
              hasAccess: true
            }
          });
        } else if (item.productType === "EBOOK") {
          // Registrar download do ebook
          await prisma.ebookDownload.create({
            data: {
              ebookId: item.productId,
              userId: userId,
              userName: userName || "Usuário",
              userEmail: userEmail || "email@exemplo.com",
              orderId
            }
          });
        }
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao processar webhook do MercadoPago:", error);
    return NextResponse.json(
      { error: "Erro ao processar notificação" },
      { status: 500 }
    );
  }
} 