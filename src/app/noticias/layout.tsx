import { Metadata } from "next";
import Footer from "@/components/shared/Footer";
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: "Notícias | Madua - Notícias de Israel",
    template: "%s | Madua - Notícias de Israel",
  },
  description: "Acompanhe as últimas notícias, análises e acontecimentos de Israel com cobertura completa e atualizada.",
  openGraph: {
    title: "Notícias | Madua - Notícias de Israel",
    description: "Acompanhe as últimas notícias, análises e acontecimentos de Israel com cobertura completa e atualizada.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Notícias | Madua - Notícias de Israel",
    description: "Acompanhe as últimas notícias, análises e acontecimentos de Israel com cobertura completa e atualizada.",
  },
  alternates: {
    canonical: "https://madua.com.br/noticias",
  },
};

export default function NoticiasLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
} 