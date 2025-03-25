"use client";

import { useEffect } from 'react';

// Não precisamos mais declarar os tipos aqui, pois estão no arquivo onesignal.d.ts
// Removendo definições duplicadas

export default function OneSignalInitializer() {
  useEffect(() => {
    // Garantir que o código seja executado apenas no lado do cliente
    if (typeof window !== 'undefined') {
      // O objeto OneSignal já foi criado pelo script no layout
      if (window.OneSignal) {
        // Configurar o comportamento de slidedown automático
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(function(OneSignal) {
          // Desativar o botão de notificação flutuante
          OneSignal.Notifications.setDefaultUrl(window.location.origin);

          // Verificar se o usuário já concedeu permissão
          const checkAndShowSlidedown = async () => {
            // Aguardar um pequeno período para dar tempo do OneSignal carregar completamente
            setTimeout(async () => {
              try {
                // Verificar o status da permissão
                const permission = await OneSignal.Notifications.permission;
                
                // Se o usuário ainda não decidiu sobre permissões, mostrar o slidedown
                if (permission !== 'granted' && permission !== 'denied') {
                  // Exibir o slidedown de notificação automaticamente
                  await OneSignal.Slidedown.promptPush({
                    autoPrompt: true,
                    categoryOptions: {
                      positiveUpdateButton: "Permitir",
                      negativeUpdateButton: "Cancelar",
                      savingButtonText: "Salvando...",
                      errorButtonText: "Tentar novamente",
                      confirmMessage: "Clique em PERMITIR para receber as últimas notícias sobre Israel",
                      actionMessage: "Fique por dentro das últimas notícias sobre Israel diretamente no seu dispositivo",
                      exampleNotificationTitleDesktop: "Notícia importante sobre Israel",
                      exampleNotificationMessageDesktop: "Esta é um exemplo de como você receberá nossas notificações",
                      exampleNotificationCaption: "Você pode cancelar a qualquer momento",
                      acceptButton: "PERMITIR",
                      cancelButton: "AGORA NÃO",
                    }
                  });
                }
              } catch (error) {
                console.error("Erro ao verificar permissão ou exibir slidedown:", error);
              }
            }, 2000); // Aguardar 2 segundos para dar tempo de carregar
          };

          checkAndShowSlidedown();
        });
      } else {
        // Se por algum motivo não foi inicializado, podemos fazer isso aqui
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async function(OneSignal) {
          await OneSignal.init({
            appId: "f6846faa-f562-44e5-b7ac-7f1fe0e45c74",
            safari_web_id: "web.onesignal.auto.103c5ae1-79d5-4292-a45e-cec7ddd48c52",
            notifyButton: {
              enable: false, // Desativar o botão flutuante
            },
            allowLocalhostAsSecureOrigin: true,
          });
          
          // Configurar o slidedown após inicialização
          OneSignal.Notifications.setDefaultUrl(window.location.origin);
          
          // Exibir o slidedown de notificação automaticamente após 2 segundos
          setTimeout(async () => {
            try {
              await OneSignal.Slidedown.promptPush({
                autoPrompt: true,
                categoryOptions: {
                  positiveUpdateButton: "Permitir",
                  negativeUpdateButton: "Cancelar",
                  savingButtonText: "Salvando...",
                  errorButtonText: "Tentar novamente",
                  confirmMessage: "Clique em PERMITIR para receber as últimas notícias sobre Israel",
                  actionMessage: "Fique por dentro das últimas notícias sobre Israel diretamente no seu dispositivo",
                  exampleNotificationTitleDesktop: "Notícia importante sobre Israel",
                  exampleNotificationMessageDesktop: "Esta é um exemplo de como você receberá nossas notificações",
                  exampleNotificationCaption: "Você pode cancelar a qualquer momento",
                  acceptButton: "PERMITIR",
                  cancelButton: "AGORA NÃO",
                }
              });
            } catch (error) {
              console.error("Erro ao exibir slidedown:", error);
            }
          }, 2000);
        });
      }
    }
  }, []);

  // Este componente não renderiza nada visualmente
  return null;
} 