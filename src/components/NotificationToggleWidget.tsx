'use client';

import { useEffect } from 'react';
import NotificationToggle from './NotificationToggle';

export default function NotificationToggleWidget() {
  useEffect(() => {
    // Renderizar o componente NotificationToggle no container
    const container = document.getElementById('notification-toggle-container');
    if (container) {
      // Limpar qualquer conteúdo anterior
      container.innerHTML = '';
      
      // Criar um elemento div para o componente
      const toggleElement = document.createElement('div');
      toggleElement.id = 'notification-toggle-element';
      container.appendChild(toggleElement);
      
      // Renderizar o componente no elemento criado
      const root = document.getElementById('notification-toggle-element');
      if (root) {
        root.appendChild(document.createElement('div')).id = 'notification-toggle-root';
        const rootElement = document.getElementById('notification-toggle-root');
        if (rootElement) {
          rootElement.innerHTML = `
            <button 
              id="notification-subscribe-button"
              class="px-4 py-2 rounded-lg flex items-center space-x-2 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1" 
                />
              </svg>
              <span>Ativar notificações</span>
            </button>
          `;
          
          // Adicionar o event listener
          const button = document.getElementById('notification-subscribe-button');
          if (button) {
            button.addEventListener('click', () => {
              if ('Notification' in window) {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    // Sucesso - mostrar mensagem
                    button.innerHTML = `
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        class="h-5 w-5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="2" 
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1" 
                        />
                      </svg>
                      <span>Notificações ativadas</span>
                    `;
                    button.classList.remove('bg-blue-100', 'text-blue-800', 'hover:bg-blue-200');
                    button.classList.add('bg-green-100', 'text-green-800', 'hover:bg-green-200');
                    
                    // Mostrar notificação de boas-vindas
                    new Notification('Notificações ativadas!', {
                      body: 'Você agora receberá notificações de novos artigos e atualizações do Madua.',
                      icon: '/logo192.png'
                    });
                  }
                });
              } else {
                alert('Seu navegador não suporta notificações push. Por favor, use um navegador mais recente.');
              }
            });
          }
        }
      }
    }
  }, []);
  
  return null; // Este componente não renderiza nada diretamente
} 