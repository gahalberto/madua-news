'use client';

import dynamic from 'next/dynamic';

// Carregamento dinâmico do componente que divide o conteúdo
const ArticleContentWithTelegram = dynamic(
  () => import('./ArticleContentWithTelegram'),
  { ssr: false }
);

interface ClientArticleContentProps {
  content: string;
}

// Este componente funciona como intermediário cliente que pode usar dynamic com ssr: false
export default function ClientArticleContent({ content }: ClientArticleContentProps) {
  return <ArticleContentWithTelegram content={content} />;
} 