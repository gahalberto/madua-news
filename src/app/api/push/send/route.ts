import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendOneSignalNotification } from '@/lib/onesignal';

/**
 * API para enviar notificações push via OneSignal
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação (somente admin pode enviar notificações)
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Extrair dados da notificação do corpo da requisição
    const notificationData = await request.json();
    
    if (!notificationData.title || !notificationData.message) {
      return NextResponse.json(
        { error: 'Título e mensagem são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Preparar notificação para o OneSignal
    const notification = {
      headings: {
        en: notificationData.title,
        pt: notificationData.title
      },
      contents: {
        en: notificationData.message,
        pt: notificationData.message
      },
      url: notificationData.url || 'https://madua.com.br',
      included_segments: notificationData.segments || ['Subscribed Users'],
      chrome_web_icon: notificationData.icon || 'https://madua.com.br/logo192.png'
    };
    
    // Enviar notificação via OneSignal
    const result = await sendOneSignalNotification(notification);
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao enviar notificação');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notificação enviada com sucesso',
      data: result.data
    });
  } catch (error) {
    console.error('Erro ao enviar notificação push:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
} 