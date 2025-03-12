import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Interface para os itens do checkout
interface CheckoutItem {
  id: string;
  type: 'course' | 'ebook';
  quantity: number;
  price: number;
}

// POST - Criar uma preferência de pagamento no Mercado Pago
export async function POST(req: NextRequest) {
  try {
    // Verificar se o usuário está autenticado
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Você precisa estar logado para finalizar a compra" },
        { status: 401 }
      );
    }
    
    // Obter dados do corpo da requisição
    const data = await req.json();
    const items: CheckoutItem[] = data.items;
    
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Nenhum item no carrinho" },
        { status: 400 }
      );
    }
    
    // Buscar informações dos itens no banco de dados
    const itemsData = await Promise.all(
      items.map(async (item) => {
        if (item.type === 'ebook') {
          const ebook = await prisma.ebook.findUnique({
            where: { id: item.id, isPublished: true }
          });
          
          if (!ebook) {
            throw new Error(`E-book não encontrado: ${item.id}`);
          }
          
          // Usar o preço promocional se disponível
          const price = ebook.promotionalPrice !== null ? ebook.promotionalPrice : ebook.price;
          
          return {
            id: ebook.id,
            title: ebook.title,
            description: `E-book: ${ebook.title}`,
            type: 'ebook',
            quantity: item.quantity,
            unit_price: price,
            currency_id: "BRL",
            picture_url: ebook.coverImageUrl || undefined
          };
        } else if (item.type === 'course') {
          const course = await prisma.course.findUnique({
            where: { id: item.id, isPublished: true }
          });
          
          if (!course) {
            throw new Error(`Curso não encontrado: ${item.id}`);
          }
          
          // Usar o preço promocional se disponível
          const price = course.promotionalPrice !== null ? course.promotionalPrice : course.price;
          
          return {
            id: course.id,
            title: course.title,
            description: `Curso: ${course.title}`,
            type: 'course',
            quantity: item.quantity,
            unit_price: price,
            currency_id: "BRL",
            picture_url: course.coverImageUrl || undefined
          };
        } else {
          throw new Error(`Tipo de item inválido: ${item.type}`);
        }
      })
    );
    
    // Calcular o total do pedido
    const total = itemsData.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    
    // Criar um pedido no banco de dados
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: "PENDING",
        total,
        orderItems: {
          create: itemsData.map(item => ({
            productId: item.id,
            productType: item.type.toUpperCase(),
            quantity: item.quantity,
            price: item.unit_price,
            title: item.title
          }))
        }
      }
    });
    
    // Configurar o Mercado Pago
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN as string 
    });
    
    const preference = new Preference(client);
    
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
      throw new Error("Usuário não encontrado");
    }
    
    // Criar a preferência de pagamento
    const result = await preference.create({
      body: {
        items: itemsData.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: item.currency_id,
          picture_url: item.picture_url
        })),
        external_reference: order.id,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/sucesso`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/falha`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/pendente`
        },
        auto_return: "approved",
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
        // Adicionar informações do usuário nos metadados
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
    
    // Atualizar o pedido com a referência do Mercado Pago
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: result.id
      }
    });
    
    return NextResponse.json({
      orderId: order.id,
      checkoutUrl: result.init_point
    });
  } catch (error) {
    console.error("Erro ao processar checkout:", error);
    return NextResponse.json(
      { error: "Erro ao processar o checkout" },
      { status: 500 }
    );
  }
} 