'use client';

import { useState, useEffect } from 'react';
import { requestNotificationPermission, isPushSupported } from '@/lib/webPushUtils';

export default function NotificationToggle() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar se o navegador suporta notificações
    const supported = isPushSupported();
    setSupported(supported);

    // Verificar permissão atual
    if (supported && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (!supported) return;
    
    setLoading(true);
    
    try {
      // Solicitar permissão se ainda não foi concedida
      if (permission !== 'granted') {
        const newPermission = await requestNotificationPermission();
        setPermission(newPermission);
        
        // Se a permissão foi concedida, podemos configurar o OneSignal aqui
        if (newPermission === 'granted') {
          // Inicializar OneSignal (ou só mostrar mensagem de sucesso)
          // Aqui você pode chamar a função que inicializa o OneSignal
          showWelcomeNotification();
        }
      } else {
        // Se já tem permissão, podemos mostrar configurações adicionais ou desativar
        // Este é um exemplo simples - para realmente desativar as notificações
        // você precisaria de mais lógica no seu sistema
        alert('Para desativar as notificações, acesse as configurações do seu navegador.');
      }
    } catch (error) {
      console.error('Erro ao configurar notificações:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Mostrar uma notificação de boas-vindas
  const showWelcomeNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Notificações ativadas!', {
        body: 'Você agora receberá notificações de novos artigos e atualizações do Madua.',
        icon: '/logo192.png'
      });
    }
  };
  
  // Se o navegador não suporta notificações, não exibe nada
  if (!supported) return null;

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleToggleNotifications}
        disabled={loading}
        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
          permission === 'granted' 
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        } transition-colors`}
      >
        {loading ? (
          <span>Processando...</span>
        ) : (
          <>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1" 
              />
            </svg>
            
            <span>
              {permission === 'granted' 
                ? 'Notificações ativadas'
                : 'Ativar notificações'}
            </span>
          </>
        )}
      </button>
      
      {permission === 'denied' && (
        <p className="text-sm text-red-600">
          Notificações bloqueadas. Altere as permissões nas configurações do seu navegador.
        </p>
      )}
    </div>
  );
} 