'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NotificationButtonWrapper from './NotificationButtonWrapper';

export default function InArticleNotificationPrompt() {
  const [expanded, setExpanded] = useState(false);
  // Verificar se estamos em um dispositivo móvel
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar dispositivo móvel ao montar o componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent));
    }
  }, []);

  return (
    <div className="my-8 border-t border-b border-blue-100 py-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0 hidden sm:block">
            <div className="bg-blue-600 rounded-full p-3 text-white">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </div>
          </div>
          
          <div className="ml-0 sm:ml-4 flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Fique por dentro das notícias sobre Israel
            </h3>
            
            <p className="text-gray-700 mb-4">
              Receba as principais atualizações diretamente no seu navegador. Seja o primeiro a saber sobre eventos importantes.
            </p>
            
            {expanded ? (
              <>
                <NotificationButtonWrapper />
                {isMobile && (
                  <div className="mt-4 text-center">
                    <Link href="/notificacoes" className="text-blue-600 underline hover:text-blue-800">
                      Instruções detalhadas para dispositivos móveis
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setExpanded(true)}
                  className="w-full sm:w-auto text-center inline-flex items-center justify-center px-5 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                  Ativar notificações
                </button>
                <Link
                  href="/notificacoes"
                  className="w-full sm:w-auto text-center inline-flex items-center justify-center px-5 py-3 border border-blue-300 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Saiba mais
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 