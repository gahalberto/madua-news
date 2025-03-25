"use client";

import { useEffect } from 'react';

export default function OneSignalPrompt() {
  useEffect(() => {
    // Verifica se o OneSignal está disponível
    if (typeof window !== 'undefined' && window.OneSignal) {
      // Aguarda um pouco para garantir que a página foi completamente carregada
      const timer = setTimeout(() => {
        try {
          console.log('Exibindo popup de notificação do OneSignal');
          // Usa typecasting para informar o TypeScript que o OneSignal existe
          const OneSignal = window.OneSignal;
          if (OneSignal && OneSignal.Slidedown) {
            OneSignal.Slidedown.promptPush({
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
          console.error('Erro ao exibir popup de notificação:', error);
        }
      }, 3000); // Aguarda 3 segundos

      return () => clearTimeout(timer);
    }
  }, []);

  // Este componente não renderiza nada visualmente
  return null;
} 