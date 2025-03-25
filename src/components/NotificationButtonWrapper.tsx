'use client';

import dynamic from 'next/dynamic';

// Carregamento dinâmico do botão de notificação apenas no lado do cliente
const NotificationButton = dynamic(() => import('./NotificationButton'), {
  ssr: false
});

// Componente wrapper que é um Client Component e pode usar dynamic com ssr: false
export default function NotificationButtonWrapper() {
  return <NotificationButton />;
} 