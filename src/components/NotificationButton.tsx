'use client';

import { useState, useEffect } from 'react';

export default function NotificationButton() {
  const [permissionState, setPermissionState] = useState<'default' | 'granted' | 'denied'>('default');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar dispositivo móvel
    const userAgent = window.navigator.userAgent.toLowerCase();
    const mobileCheck = /android|webos|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent);
    const iosCheck = /iphone|ipad|ipod/.test(userAgent);
    
    setIsMobile(mobileCheck);
    setIsIOS(iosCheck);
    
    // Verificar o estado de permissão atual (apenas para navegadores compatíveis)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission as 'default' | 'granted' | 'denied');
    }
    
    // Verificar se o OneSignal está disponível e configurar ouvintes de eventos
    if (window.OneSignal) {
      // Atualizar o estado quando a permissão mudar
      window.OneSignal.on('notificationPermissionChange', function(event) {
        setPermissionState(event.to);
      });
    }
  }, []);

  const requestPermission = async () => {
    if (!window.OneSignal) return;
    
    setLoading(true);
    try {
      // Mostrar o slidedown de notificação
      await window.OneSignal.Slidedown.promptPush();
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
    } finally {
      setLoading(false);
    }
  };

  // Instruções específicas para iOS
  if (isIOS) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100 mb-6">
        <h3 className="font-bold text-lg mb-2">Receba notícias no seu iPhone/iPad</h3>
        <p className="mb-4">Para receber notificações no iOS, siga estes passos:</p>
        <ol className="list-decimal pl-5 mb-4 text-left space-y-2">
          <li>Clique no botão compartilhar <span className="inline-block px-2 py-1 bg-gray-200 rounded">📤</span></li>
          <li>Selecione "Adicionar à Tela de Início"</li>
          <li>Abra o app da tela inicial para receber notificações</li>
        </ol>
        <button
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => window.open('https://madua.com.br/noticias')}
        >
          Abrir no Safari
        </button>
      </div>
    );
  }

  // Instruções para outros dispositivos móveis
  if (isMobile && permissionState !== 'granted') {
    return (
      <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mb-6 text-left">
        <h3 className="font-bold text-lg mb-2 text-center">Notificações em dispositivos móveis</h3>
        <p className="mb-3">Para uma melhor experiência com notificações:</p>
        <ol className="list-decimal pl-5 mb-4 space-y-2">
          <li>Instale nosso site como um aplicativo</li>
          <li>Toque no botão do menu do seu navegador</li>
          <li>Selecione "Adicionar à tela inicial" ou "Instalar aplicativo"</li>
          <li>Abra o aplicativo para ativar as notificações</li>
        </ol>
        <button
          onClick={requestPermission}
          disabled={loading}
          className={`w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
          )}
          {loading ? 'Aguarde...' : 'Tentar ativar notificações'}
        </button>
      </div>
    );
  }

  // Renderizar botão diferente com base no estado da permissão
  if (permissionState === 'granted') {
    return (
      <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
        <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span className="text-green-800">Notificações ativadas com sucesso!</span>
      </div>
    );
  }

  if (permissionState === 'denied') {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
        <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <span className="text-red-800">Notificações bloqueadas. Altere as permissões nas configurações do seu navegador.</span>
      </div>
    );
  }

  return (
    <button
      onClick={requestPermission}
      disabled={loading}
      className={`flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors w-full max-w-md mx-auto mb-6 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
      ) : (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
      )}
      {loading ? 'Aguarde...' : 'Receber notificações no navegador'}
    </button>
  );
} 