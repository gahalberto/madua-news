import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";

interface CartItem {
  id: string;
  type?: 'course' | 'ebook';
  title: string;
  price: number;
  quantity: number;
  coverImageUrl?: string;
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
    
    // Validar e normalizar os itens
    const validatedItems = items.map((item: CartItem) => ({
      ...item,
      type: item.type || 'ebook', // Definir um valor padrão se não existir
      quantity: item.quantity || 1,
      coverImageUrl: item.coverImageUrl || item.imageUrl
    }));
    
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
    
    // Calcular o total do pedido
    const total = validatedItems.reduce((sum: number, item: CartItem) => sum + (item.price * (item.quantity || 1)), 0);
    
    // Criar um pedido no banco de dados
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: "PENDING",
        total,
        orderItems: {
          create: await Promise.all(validatedItems.map(async (item: CartItem) => {
            const type = (item.type || 'ebook').toUpperCase();
            const isStripeProduct = item.id.startsWith('prod_');
            
            // Criar um produto para satisfazer a relação de chave estrangeira
            const productId = `${type.toLowerCase()}-${item.id}`;
            
            const product = await prisma.product.upsert({
              where: { id: productId },
              update: {
                name: item.title,
                price: item.price,
                description: `${type === 'EBOOK' ? 'E-book' : 'Curso'}: ${item.title}`,
                imageUrl: item.coverImageUrl || item.imageUrl
              },
              create: {
                id: productId,
                name: item.title,
                price: item.price,
                description: `${type === 'EBOOK' ? 'E-book' : 'Curso'}: ${item.title}`,
                imageUrl: item.coverImageUrl || item.imageUrl,
                stock: 999 // Produtos digitais têm estoque virtualmente ilimitado
              }
            });
            
            // Preparar o objeto OrderItem básico (sem ebookId)
            const orderItem = {
              productId: product.id,
              productType: type,
              quantity: item.quantity || 1,
              price: item.price,
              title: item.title
            };
            
            // Adicionar ebookId apenas se for um e-book e o ID NÃO for um ID do Stripe
            // E apenas se o e-book existir no banco de dados
            if (type === 'EBOOK' && !isStripeProduct) {
              try {
                // Verificar se o e-book existe
                const ebook = await prisma.ebook.findUnique({
                  where: { id: item.id }
                });
                
                if (ebook) {
                  return {
                    ...orderItem,
                    ebookId: item.id
                  };
                }
              } catch {
                console.log(`Ebook com ID ${item.id} não encontrado, continuando sem associar ebookId`);
              }
            }
            
            // Retornar o orderItem sem ebookId
            return orderItem;
          }))
        }
      }
    });
    
    // URL base para redirecionamento
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    
    // Criar uma sessão de checkout do Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: validatedItems.map((item: CartItem) => {
        // Validar URL da imagem
        let imageUrls: string[] = [];
        if (item.coverImageUrl) {
          try {
            // Verificar se a URL é válida
            new URL(item.coverImageUrl);
            // Verificar se a URL começa com http:// ou https://
            if (item.coverImageUrl.startsWith('http://') || item.coverImageUrl.startsWith('https://')) {
              imageUrls = [item.coverImageUrl];
            }
          } catch {
            console.log(`URL de imagem inválida: ${item.coverImageUrl}`);
            // Não adicionar a URL se for inválida
          }
        }

        return {
          price_data: {
            currency: 'brl',
            product_data: {
              name: item.title,
              images: imageUrls,
              metadata: {
                productId: item.id,
                productType: item.type || 'ebook'
              }
            },
            unit_amount: Math.round(item.price * 100), // Stripe usa centavos
          },
          quantity: item.quantity || 1,
        };
      }),
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      customer_email: user.email || undefined,
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
        userId: user.id,
        userName: user.name || '',
        userEmail: user.email || ''
      }
    });
    
    // Atualizar o pedido com a referência do Stripe
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentIntentId: stripeSession.payment_intent as string
      }
    });
    
    return NextResponse.json({ 
      sessionId: stripeSession.id,
      url: stripeSession.url
    });
  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error);
    return NextResponse.json(
      { error: "Erro ao processar o pagamento" },
      { status: 500 }
    );
  }
} 