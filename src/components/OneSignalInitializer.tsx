"use client";

import { useEffect } from 'react';

/**
 * Este componente inicializa o OneSignal e propõe configurações diferentes
 * com base no dispositivo do usuário para maximizar a compatibilidade.
 */
export default function OneSignalInitializer() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Detectar dispositivo móvel
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent);
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    // Configurar OneSignal
    if (window.OneSignal) {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(function(OneSignal) {
        // Definir a URL padrão para notificações
        OneSignal.Notifications.setDefaultUrl(window.location.origin);
        
        // Verificar se o usuário já concedeu permissão
        const checkAndSetupNotifications = async () => {
          try {
            const permission = await OneSignal.Notifications.permission;
            
            // Em dispositivos móveis, usamos uma abordagem diferente
            if (isMobile) {
              if (isIOS) {
                // No iOS, verificamos se o site está sendo executado como PWA
                const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
                if (!isInStandaloneMode) {
                  // Se não estiver em modo standalone, não exibimos o prompt de notificação
                  // pois o Safari iOS não suporta notificações push em sites regulares
                  console.log('iOS detectado fora do modo PWA, notificações não disponíveis');
                  return;
                }
              }
              
              // Em dispositivos Android, esperamos que o usuário interaja com o site antes
              let hasInteracted = false;
              
              const handleInteraction = () => {
                if (!hasInteracted) {
                  hasInteracted = true;
                  // Remover os event listeners depois da primeira interação
                  document.removeEventListener('click', handleInteraction);
                  document.removeEventListener('touchstart', handleInteraction);
                  window.removeEventListener('scroll', handleInteraction);
                  
                  // Aguardar um pouco antes de mostrar o prompt de notificação
                  setTimeout(() => {
                    if (permission !== 'granted' && permission !== 'denied') {
                      console.log('Tentando exibir slidedown após interação do usuário em dispositivo móvel');
                      OneSignal.Slidedown.promptPush();
                    }
                  }, 2000);
                }
              };
              
              // Adicionar event listeners para detectar interação do usuário
              document.addEventListener('click', handleInteraction);
              document.addEventListener('touchstart', handleInteraction);
              window.addEventListener('scroll', handleInteraction);
            } else {
              // Em desktops, podemos mostrar o prompt depois de um atraso curto
              setTimeout(() => {
                if (permission !== 'granted' && permission !== 'denied') {
                  console.log('Tentando exibir slidedown em desktop após atraso');
                  OneSignal.Slidedown.promptPush();
                }
              }, 3000);
            }
          } catch (error) {
            console.error("Erro ao verificar permissão ou exibir slidedown:", error);
          }
        };

        // Aguardar um pouco para dar tempo do OneSignal carregar completamente
        setTimeout(checkAndSetupNotifications, 1000);
      });
    }
  }, []);

  return null;
} 