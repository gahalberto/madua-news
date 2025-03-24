'use client';

/**
 * Utilitários para Web Push Notifications usando a API nativa
 */

// Verificar se o navegador suporta notificações push
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Solicitar permissão para enviar notificações
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error('Este navegador não suporta notificações push');
  }
  
  return await Notification.requestPermission();
}

// Registrar o service worker para notificações
export async function registerPushWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) {
    console.warn('Este navegador não suporta notificações push');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/push-service-worker.js');
    console.log('Service Worker registrado com sucesso');
    return registration;
  } catch (error) {
    console.error('Erro ao registrar Service Worker:', error);
    return null;
  }
}

// Enviar assinatura para o servidor
export async function subscribeUserToPush(
  registration: ServiceWorkerRegistration, 
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
    
    console.log('Usuário inscrito para receber notificações push');
    
    // Enviar a assinatura para o servidor
    await sendSubscriptionToServer(subscription);
    
    return subscription;
  } catch (error) {
    console.error('Erro ao inscrever para notificações push:', error);
    return null;
  }
}

// Enviar assinatura para o servidor
async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    const response = await fetch('/api/push/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao registrar assinatura no servidor');
    }
    
    console.log('Assinatura registrada com sucesso no servidor');
  } catch (error) {
    console.error('Erro ao enviar assinatura para o servidor:', error);
  }
}

// Função auxiliar para converter chave VAPID
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Mostrar notificação
export function showNotification(title: string, options: NotificationOptions = {}): void {
  if (!('Notification' in window)) {
    console.warn('Este navegador não suporta notificações');
    return;
  }
  
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, options);
      }
    });
  }
} 