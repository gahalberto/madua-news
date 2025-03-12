import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import stripe from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Webhook error: ${errorMessage}`);
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  // Processar o evento com base no tipo
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        
        // Obter metadados da sessão
        const orderId = session.client_reference_id;
        const userId = session.metadata?.userId;
        const userName = session.metadata?.userName;
        const userEmail = session.metadata?.userEmail;
        
        // Registrar o pagamento no log
        await prisma.paymentLog.create({
          data: {
            paymentId: session.id,
            orderId,
            status: "COMPLETED",
            amount: session.amount_total / 100, // Converter de centavos para reais
            paymentMethod: "stripe",
            paymentType: "card",
            userId: userId || null,
            userName: userName || null,
            userEmail: userEmail || null,
            rawData: JSON.stringify(session)
          }
        });
        
        // Atualizar o status do pedido
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "COMPLETED" }
        });
        
        // Conceder acesso aos produtos comprados
        const orderItems = await prisma.orderItem.findMany({
          where: { orderId }
        });
        
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
        
        break;
      }
      
      case "checkout.session.expired": {
        const session = event.data.object;
        const orderId = session.client_reference_id;
        
        // Atualizar o status do pedido para expirado
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "FAILED" }
        });
        
        break;
      }
      
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        
        // Buscar o pedido pelo paymentIntentId
        const order = await prisma.order.findFirst({
          where: { paymentIntentId: paymentIntent.id }
        });
        
        if (order) {
          // Atualizar o status do pedido para falha
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "FAILED" }
          });
        }
        
        break;
      }
    }
    
    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return new NextResponse("Erro ao processar webhook", { status: 500 });
  }
} 