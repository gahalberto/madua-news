/* 
 * Service Worker para Web Push Notifications
 * Este arquivo deve estar na pasta public/ para ser acessível na raiz do site
 */

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Notificação push recebida.');
  
  let notificationData = {};
  
  try {
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (e) {
    console.error('[Service Worker] Erro ao processar dados da notificação:', e);
  }
  
  // Dados padrão caso não seja possível extrair do evento
  const title = notificationData.title || 'Madua - Novas Atualizações';
  const options = {
    body: notificationData.body || 'Temos novidades para você!',
    icon: notificationData.icon || '/logo192.png',
    badge: notificationData.badge || '/badge.png',
    image: notificationData.image,
    data: {
      url: notificationData.url || '/',
      ...notificationData.data
    },
    actions: notificationData.actions || [
      { action: 'explore', title: 'Ver Agora' },
      { action: 'close', title: 'Mais Tarde' }
    ],
    // Vibração: [tempo vibrando, tempo pausado, tempo vibrando, ...]
    vibrate: notificationData.vibrate || [100, 50, 100, 50, 100]
  };
  
  // Exibir a notificação
  const notificationPromise = self.registration.showNotification(title, options);
  event.waitUntil(notificationPromise);
});

// Lidar com cliques na notificação
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notificação clicada', event.notification.tag);
  
  // Fechar a notificação
  event.notification.close();
  
  // Se a notificação tiver uma URL associada, abrir essa URL
  let url = '/';
  
  if (event.notification.data && event.notification.data.url) {
    url = event.notification.data.url;
  }
  
  // Verificar qual ação foi clicada (se existir)
  if (event.action === 'close') {
    // Não faz nada além de fechar a notificação
    return;
  }
  
  // Abrir a URL em uma aba existente ou criar uma nova
  const urlOpenPromise = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
  .then((windowClients) => {
    // Verificar se já existe uma janela/aba aberta com a URL
    const matchingClient = windowClients.find((client) => {
      return client.url === url;
    });
    
    // Se existe, focar nela
    if (matchingClient) {
      return matchingClient.focus();
    }
    
    // Se não existe, abrir uma nova
    return clients.openWindow(url);
  });
  
  event.waitUntil(urlOpenPromise);
});

// Quando o Service Worker é instalado
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Instalado');
  self.skipWaiting(); // Tomar o controle imediatamente
});

// Quando o Service Worker é ativado
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Ativado');
  return self.clients.claim(); // Tomar o controle de todas as páginas
}); 