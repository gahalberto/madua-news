'use client';

import { ReactNode } from 'react';
import OneSignalInitializer from './OneSignalInitializer';

interface ClientProvidersProps {
  children: ReactNode;
}

/**
 * Componente que envolve todos os provedores de funcionalidades do lado do cliente.
 * Atualmente inclui:
 * - OneSignal para notificações push
 */
export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <>
      <OneSignalInitializer />
      {children}
    </>
  );
} 