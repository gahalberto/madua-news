import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ClientOnly from "@/components/ClientOnly";
import NotificationButtonWrapper from "@/components/NotificationButtonWrapper";

export const metadata: Metadata = {
  title: "Ative as Notificações | Madua - Notícias de Israel",
  description: "Saiba como ativar as notificações do Madua em seu dispositivo e fique por dentro das últimas notícias sobre Israel em tempo real.",
  openGraph: {
    title: "Ative as Notificações do Madua",
    description: "Receba as últimas notícias sobre Israel diretamente no seu dispositivo. Aprenda como ativar as notificações do Madua.",
    images: [
      {
        url: "/images/notifications-og.jpg",
        width: 1200,
        height: 630,
        alt: "Ative as Notificações do Madua"
      }
    ]
  }
};

export default function NotificacoesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
        Receba Notificações sobre Israel
      </h1>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-10 shadow-sm">
        <div className="text-center mb-6">
          <ClientOnly>
            <NotificationButtonWrapper />
          </ClientOnly>
        </div>
        <p className="text-lg text-center mb-4">
          Nunca perca uma atualização importante. Ative as notificações e receba as últimas notícias sobre Israel em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="bg-blue-600 text-white p-2 rounded-full mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </span>
            Computador (Desktop)
          </h2>
          <ol className="list-decimal pl-6 space-y-3 text-gray-700">
            <li>Clique no botão "Receber notificações no navegador" acima</li>
            <li>Quando solicitado pelo navegador, clique em "Permitir"</li>
            <li>Pronto! Você já está inscrito para receber notificações</li>
          </ol>
          <p className="mt-4 text-sm text-gray-600">
            Compatível com Google Chrome, Firefox, Edge, Opera e outros navegadores baseados em Chromium.
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="bg-blue-600 text-white p-2 rounded-full mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </span>
            Android
          </h2>
          <ol className="list-decimal pl-6 space-y-3 text-gray-700">
            <li>Clique no botão "Receber notificações no navegador" acima</li>
            <li>Quando solicitado, clique em "Permitir"</li>
            <li>Para uma melhor experiência, instale o site como aplicativo:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Toque nos três pontos ⋮ no canto superior direito</li>
                <li>Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"</li>
              </ul>
            </li>
          </ol>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="bg-blue-600 text-white p-2 rounded-full mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </span>
            iPhone e iPad (iOS)
          </h2>
          <ol className="list-decimal pl-6 space-y-3 text-gray-700">
            <li>No Safari, toque no botão de compartilhamento 
              <span className="inline-block mx-1 px-2 py-1 bg-gray-200 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                </svg>
              </span>
            </li>
            <li>Role para baixo e toque em "Adicionar à Tela de Início"</li>
            <li>Toque em "Adicionar" no canto superior direito</li>
            <li>Abra o aplicativo Madua da sua tela inicial</li>
            <li>Agora você poderá receber notificações! (somente ao usar o app)</li>
          </ol>
          <p className="mt-4 text-sm text-gray-600">
            Nota: No iOS, as notificações só funcionam quando você usa o site como um aplicativo instalado na tela inicial.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="bg-blue-600 text-white p-2 rounded-full mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </span>
            Problemas Comuns
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold">Notificações bloqueadas</h3>
              <p>Se você bloqueou as notificações anteriormente:</p>
              <ul className="list-disc pl-6 mt-1">
                <li>Clique no ícone de cadeado ou informações na barra de endereço</li>
                <li>Encontre as configurações de "Notificações" e mude para "Permitir"</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Notificações não aparecem</h3>
              <ul className="list-disc pl-6 mt-1">
                <li>Verifique as configurações do seu navegador</li>
                <li>Certifique-se de que as notificações push estão ativadas no sistema</li>
                <li>Em dispositivos móveis, certifique-se de que o modo "Não perturbe" está desativado</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h2 className="text-xl font-bold mb-4 text-center">Por que ativar as notificações?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full p-3 inline-flex justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 className="font-bold mb-2">Atualizações em Tempo Real</h3>
            <p className="text-gray-700">Receba notícias urgentes sobre Israel assim que acontecerem</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full p-3 inline-flex justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
              </svg>
            </div>
            <h3 className="font-bold mb-2">Análises Exclusivas</h3>
            <p className="text-gray-700">Seja alertado sobre novas análises e artigos aprofundados</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full p-3 inline-flex justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </div>
            <h3 className="font-bold mb-2">Controle Total</h3>
            <p className="text-gray-700">Você pode cancelar as notificações a qualquer momento</p>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-10">
        <Link href="/noticias" className="inline-block bg-blue-600 text-white font-medium rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors">
          Voltar para as Notícias
        </Link>
      </div>
    </div>
  );
} 