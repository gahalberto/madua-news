'use client';

/**
 * Funções auxiliares para uso no cliente
 */

/**
 * Verifica se uma URL de imagem deve ser servida diretamente (sem o componente Image do Next.js)
 * 
 * @param src URL da imagem
 * @returns true se a imagem deve ser servida diretamente
 */
export function isDirectImage(src: string | null): boolean {
  if (!src) return false;
  
  // Imagens de article-images são servidas diretamente
  if (src.includes('/article-images/')) return true;
  
  return false;
}

/**
 * Retorna a URL correta para a imagem, considerando imagens locais e remotas
 * 
 * @param src URL da imagem
 * @returns URL correta para exibição
 */
export function getImageUrl(src: string | null): string {
  if (!src) return '/images/placeholder.jpg';
  
  // Se já for uma URL completa (começa com http), retornar como está
  if (src.startsWith('http')) return src;
  
  // Se for um caminho local, garantir que comece com /
  if (!src.startsWith('/')) return `/${src}`;
  
  return src;
} 