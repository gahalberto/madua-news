import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TelegramBanner from "@/components/TelegramBanner";

export const metadata: Metadata = {
  title: "Receba Notícias pelo Telegram | Madua - Notícias de Israel",
  description: "Acompanhe as últimas notícias sobre Israel no nosso canal do Telegram e receba atualizações em tempo real.",
  openGraph: {
    title: "Receba Notícias pelo Telegram | Madua",
    description: "Acompanhe as últimas notícias sobre Israel no nosso canal do Telegram e receba atualizações em tempo real.",
    images: [
      {
        url: "/images/notifications-og.jpg",
        width: 1200,
        height: 630,
        alt: "Receba Notícias pelo Telegram | Madua"
      }
    ]
  }
};

export default function NotificacoesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
        Receba Notícias sobre Israel no Telegram
      </h1>
      
      <div className="mb-10">
        <TelegramBanner />
      </div>

      <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">
          Por que entrar no nosso canal do Telegram?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full p-4 inline-flex justify-center mb-4 mx-auto">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0.41,13.41L6,19l1.41,-1.41L1.83,12l5.58,-5.59L6,5 0.41,10.59a1,1 0,0 0,0 1.42z"/>
                <path d="M13,18l5,-5 -5,-5v3.59C3.67,11.59 3.88,10.35 5.17,7h2.02c-0.7,1.83 -0.98,2.91 1.46,5L13,12v6z"/>
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Entrega Instantânea</h3>
            <p className="text-gray-700">Receba as notícias assim que elas acontecem, sem atrasos ou filtros.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full p-4 inline-flex justify-center mb-4 mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Privacidade Garantida</h3>
            <p className="text-gray-700">O Telegram protege suas informações pessoais e não compartilha seus dados.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full p-4 inline-flex justify-center mb-4 mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Notificações Confiáveis</h3>
            <p className="text-gray-700">Sem problemas de compatibilidade com navegadores ou sistemas operacionais.</p>
          </div>
        </div>
        
        <div className="text-center">
          <a 
            href="https://t.me/maduabrasil" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium text-lg rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.25l-2.17 10.193c-.165.75-.596.937-1.218.584l-3.346-2.465-1.617 1.559c-.177.177-.33.33-.678.33l.24-3.375 6.152-5.558c.267-.24-.06-.375-.413-.135l-7.606 4.785-3.286-.998c-.72-.222-.735-.72.15-1.065l12.86-4.95c.6-.222 1.12.135.931.99z" />
            </svg>
            Acessar o Canal @maduabrasil
          </a>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-100 mb-12">
        <h2 className="text-xl font-bold mb-4">Como acessar o canal:</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg mb-3 flex items-center">
              <span className="bg-blue-600 text-white p-2 rounded-full mr-3 flex-shrink-0">1</span>
              Pelo aplicativo Telegram
            </h3>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>Abra o aplicativo Telegram em seu dispositivo</li>
              <li>Toque no ícone de pesquisa</li>
              <li>Digite "@maduabrasil" na barra de pesquisa</li>
              <li>Toque no canal e depois em "Entrar" ou "Participar"</li>
            </ol>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg mb-3 flex items-center">
              <span className="bg-blue-600 text-white p-2 rounded-full mr-3 flex-shrink-0">2</span>
              Pelo link direto
            </h3>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>Clique no botão acima ou use este link: <a href="https://t.me/maduabrasil" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">t.me/maduabrasil</a></li>
              <li>O link abrirá o aplicativo Telegram automaticamente</li>
              <li>Toque em "Participar" para começar a receber as notificações</li>
            </ol>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <Link href="/noticias" className="inline-block bg-blue-600 text-white font-medium rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors">
          Voltar para as Notícias
        </Link>
      </div>
    </div>
  );
} 