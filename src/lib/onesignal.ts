/**
 * Utilitário para enviar notificações push via OneSignal
 * 
 * Este arquivo contém funções para enviar notificações push para os usuários
 * que se inscreveram para receber atualizações do blog.
 */

interface OneSignalNotification {
  headings: {
    en: string;
    [key: string]: string;
  };
  contents: {
    en: string;
    [key: string]: string;
  };
  url?: string;
  included_segments?: string[];
  excluded_segments?: string[];
  filters?: Array<{
    field: string;
    key?: string;
    value?: string;
    operator?: string;
    relation?: string;
  }>;
  data?: Record<string, any>;
  small_icon?: string;
  large_icon?: string;
  chrome_web_icon?: string;
  firefox_icon?: string;
  ios_attachments?: Record<string, string>;
  ios_badgeType?: string;
  ios_badgeCount?: number;
}

/**
 * Envia uma notificação push via OneSignal
 * 
 * @param notification Objeto com as informações da notificação
 * @returns Resposta da API do OneSignal
 */
export async function sendOneSignalNotification(
  notification: OneSignalNotification
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const restApiKey = process.env.ONESIGNAL_REST_API_KEY;
    const appId = process.env.ONESIGNAL_APP_ID || 'f6846faa-f562-44e5-b7ac-7f1fe0e45c74';
    
    if (!restApiKey) {
      console.warn('Chave de API do OneSignal não encontrada. Ignorando notificação push.');
      return { success: false, error: 'Chave de API do OneSignal não encontrada' };
    }
    
    const payload = {
      app_id: appId,
      included_segments: notification.included_segments || ['Subscribed Users'],
      excluded_segments: notification.excluded_segments,
      filters: notification.filters,
      data: notification.data,
      headings: notification.headings,
      contents: notification.contents,
      url: notification.url,
      chrome_web_icon: notification.chrome_web_icon,
      firefox_icon: notification.firefox_icon,
    };
    
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${restApiKey}`,
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.[0] || 'Erro ao enviar notificação push');
    }
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Erro ao enviar notificação push:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Envia uma notificação de novo post para os usuários
 * 
 * @param post Dados do post
 * @returns Resultado do envio
 */
export async function notifyNewPost(post: { 
  title: string; 
  excerpt: string; 
  slug: string;
  featuredImage?: string;
}): Promise<{ success: boolean; error?: string }> {
  const blogUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madua.com.br';
  const postUrl = `${blogUrl}/blog/${post.slug}`;
  
  // Preparar a notificação
  const notification: OneSignalNotification = {
    headings: {
      en: post.title,
      pt: post.title,
    },
    contents: {
      en: post.excerpt,
      pt: post.excerpt,
    },
    url: postUrl,
    included_segments: ['Subscribed Users'],
    data: {
      postId: post.slug,
      type: 'new_post',
    },
  };
  
  // Adicionar imagem se disponível
  if (post.featuredImage) {
    notification.chrome_web_icon = post.featuredImage;
    notification.firefox_icon = post.featuredImage;
  }
  
  return await sendOneSignalNotification(notification);
} 