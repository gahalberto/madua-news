// Verifica se estamos em ambiente de desenvolvimento
const isDevelopment = self.location.hostname === 'localhost' || 
                     self.location.hostname === '127.0.0.1';

// Em desenvolvimento, carrega o script do OneSignal através do nosso proxy
if (isDevelopment) {
  self.importScripts('/api/proxy/onesignal?path=/sdks/web/v16/OneSignalSDK.sw.js');
} else {
  // Em produção, carrega diretamente do CDN do OneSignal
  self.importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
} 