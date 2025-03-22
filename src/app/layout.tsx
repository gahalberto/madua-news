import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/tiptap.css";
import AuthProvider from "@/components/auth/auth-provider";
import { CartProvider } from "@/hooks/useCart";
import { Toaster } from "@/components/ui/toaster";
import MainNavbar from "@/components/MainNavbar";
import Script from "next/script";
import Head from "next/head";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://madua.com.br'),
  title: {
    default: "Madua - Notícias de Israel em Português | Cobertura Completa",
    template: "%s | Madua - Notícias de Israel"
  },
  description: "Portal líder em notícias de Israel em português. Cobertura completa, análises aprofundadas e informações exclusivas sobre política, economia e sociedade israelense.",
  keywords: ["Israel", "notícias Israel", "Oriente Médio", "política israelense", "Tel Aviv", "Jerusalém", "sionismo", "judaísmo", "paz no oriente médio", "conflito israelense", "Hamas", "Faixa de Gaza", "Cisjordânia", "Netanyahu", "IDF"],
  authors: [{ name: "Madua News" }],
  creator: "Madua News",
  publisher: "Madua News",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://madua.com.br",
    siteName: "Madua - Notícias de Israel",
    title: "Madua - Portal Líder em Notícias de Israel em Português",
    description: "Sua fonte confiável de notícias sobre Israel. Cobertura completa e análises aprofundadas dos acontecimentos em Israel e no Oriente Médio.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Madua - Notícias de Israel"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@MaduaNews",
    creator: "@MaduaNews",
    title: "Madua - Notícias de Israel em Português",
    description: "Sua fonte confiável de notícias sobre Israel. Cobertura completa e análises aprofundadas.",
    images: ["/images/twitter-card.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "seu-código-de-verificação-do-google",
    yandex: "seu-código-yandex",
    yahoo: "seu-código-yahoo",
  },
  alternates: {
    canonical: "https://madua.com.br",
    languages: {
      'pt-BR': 'https://madua.com.br',
    }
  },
  category: "news",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return (
    <html lang="pt-BR" dir="ltr" className="light">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href="https://madua.com.br" />
        <meta name="theme-color" content="#1d4ed8" />
        <meta name="msapplication-TileColor" content="#1d4ed8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="color-scheme" content="light" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.style.colorScheme = 'light';
            `
          }}
        />
        
        {/* Em ambiente de desenvolvimento, carregamos o script do OneSignal via nosso proxy */}
        {isDevelopment && (
          <>
            <script 
              src="/api/proxy/onesignal?path=/sdks/web/v16/OneSignalSDK.page.js" 
              async 
            />
            <script 
              dangerouslySetInnerHTML={{
                __html: `
                  window.OneSignalDeferred = window.OneSignalDeferred || [];
                  OneSignalDeferred.push(async function(OneSignal) {
                    await OneSignal.init({
                      appId: "f6846faa-f562-44e5-b7ac-7f1fe0e45c74",
                      safari_web_id: "web.onesignal.auto.103c5ae1-79d5-4292-a45e-cec7ddd48c52",
                      notifyButton: {
                        enable: true,
                      },
                    });
                  });
                `
              }}
            />
          </>
        )}
      </head>
      <body 
        className={inter.className}
        style={{ 
          backgroundColor: "#ffffff", 
          color: "#171717" 
        }}
      >
        <AuthProvider>
          <CartProvider>
            <MainNavbar />
            {children}
            <Toaster />
          </CartProvider>
        </AuthProvider>
        {/* Estruturação de dados para Rich Snippets */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsMediaOrganization",
              "name": "Madua",
              "url": "https://madua.com.br",
              "logo": "https://madua.com.br/images/logo.png",
              "sameAs": [
                "https://facebook.com/MaduaNews",
                "https://twitter.com/MaduaNews",
                "https://instagram.com/MaduaNews",
                "https://linkedin.com/company/madua-news"
              ],
              "description": "Portal líder em notícias de Israel em português. Cobertura completa e análises aprofundadas.",
              "foundingDate": "2024",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "BR"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "contato@madua.com.br"
              }
            })
          }}
        />
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `
          }}
        />
        
        {/* Em produção, usamos o componente Script do Next.js */}
        {!isDevelopment && (
          <>
            <Script 
              src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" 
              strategy="afterInteractive"
              crossOrigin="anonymous"
            />
            <Script
              id="onesignal-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.OneSignalDeferred = window.OneSignalDeferred || [];
                  OneSignalDeferred.push(async function(OneSignal) {
                    await OneSignal.init({
                      appId: "f6846faa-f562-44e5-b7ac-7f1fe0e45c74",
                      safari_web_id: "web.onesignal.auto.103c5ae1-79d5-4292-a45e-cec7ddd48c52",
                      notifyButton: {
                        enable: true,
                      },
                    });
                  });
                `
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
