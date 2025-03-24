import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API para registrar assinaturas de notificações push
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação (opcional, dependendo do seu caso de uso)
    const session = await getServerSession(authOptions);
    
    // Você pode permitir assinaturas mesmo sem autenticação
    // Ou exigir autenticação:
    // if (!session) {
    //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    // }
    
    // Extrair a assinatura push do corpo da requisição
    const subscription = await request.json();
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Assinatura inválida' },
        { status: 400 }
      );
    }
    
    // Identificar usuário (se autenticado) ou usar endpoint como identificador único
    const userId = session?.user?.id;
    const endpoint = subscription.endpoint;
    
    // Salvar ou atualizar a assinatura no banco de dados
    const savedSubscription = await prisma.pushSubscription.upsert({
      where: {
        endpoint: endpoint,
      },
      update: {
        p256dh: subscription.keys?.p256dh,
        auth: subscription.keys?.auth,
        userId: userId || null,
        updatedAt: new Date(),
      },
      create: {
        endpoint: endpoint,
        p256dh: subscription.keys?.p256dh,
        auth: subscription.keys?.auth,
        userId: userId || null,
      },
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Assinatura registrada com sucesso',
      id: savedSubscription.id
    });
  } catch (error) {
    console.error('Erro ao registrar assinatura push:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 