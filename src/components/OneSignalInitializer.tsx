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
        return; // Já inicializado pelo script no layout
      }
      
      // Se por algum motivo não foi inicializado, podemos fazer isso aqui
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.init({
          appId: "f6846faa-f562-44e5-b7ac-7f1fe0e45c74",
          safari_web_id: "web.onesignal.auto.103c5ae1-79d5-4292-a45e-cec7ddd48c52",
          notifyButton: {
            enable: true,
          },
        });
      });
    }
  }, []);

  // Este componente não renderiza nada visualmente
  return null;
} 