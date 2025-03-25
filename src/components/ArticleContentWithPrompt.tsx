'use client';

import { useEffect, useState } from 'react';
import InArticleNotificationPrompt from './InArticleNotificationPrompt';

// Função para converter Markdown em HTML
function markdownToHtml(content: string): string {
  return content
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-5 mb-2">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
}

// Renderizar conteúdo HTML com segurança
export const HtmlContent = ({ html }: { html: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

interface ArticleContentWithPromptProps {
  content: string; // Conteúdo Markdown ou HTML
}

export default function ArticleContentWithPrompt({ content }: ArticleContentWithPromptProps) {
  const [firstHalf, setFirstHalf] = useState('');
  const [secondHalf, setSecondHalf] = useState('');

  useEffect(() => {
    // Converter o conteúdo Markdown para HTML
    const htmlContent = markdownToHtml(content);
    
    // Dividir o conteúdo aproximadamente pela metade
    if (htmlContent) {
      // Encontrar todos os parágrafos
      const paragraphs = htmlContent.split(/<\/p>|<\/h[1-6]>/i);
      
      if (paragraphs.length > 4) {
        // Calcular o índice para dividir o conteúdo (após o 3º parágrafo ou aproximadamente 40% do conteúdo)
        const splitIndex = Math.max(3, Math.floor(paragraphs.length * 0.4));
        
        // Juntar os parágrafos novamente com seus fechamentos de tags
        let first = '';
        let second = '';
        
        paragraphs.forEach((paragraph, index) => {
          if (!paragraph.trim()) return;
          
          // Determinar o fechamento correto da tag
          const match = paragraph.match(/<h[1-6]/i);
          const closeTag = match ? `${match[0].replace('<', '</') + '>'}` : '</p>';
          
          if (index < splitIndex) {
            first += paragraph + closeTag;
          } else {
            second += paragraph + closeTag;
          }
        });
        
        setFirstHalf(first);
        setSecondHalf(second);
      } else {
        // Se houver poucos parágrafos, mostrar todo o conteúdo antes do prompt
        setFirstHalf(htmlContent);
        setSecondHalf('');
      }
    }
  }, [content]);

  return (
    <div className="prose prose-lg max-w-none">
      {/* Primeira parte do conteúdo */}
      {firstHalf && <HtmlContent html={firstHalf} />}
      
      {/* Prompt de notificação no meio do artigo */}
      <InArticleNotificationPrompt />
      
      {/* Segunda parte do conteúdo */}
      {secondHalf && <HtmlContent html={secondHalf} />}
    </div>
  );
} 