'use client';

import Image from 'next/image';

interface ArticleImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}

export default function ArticleImage({
  src,
  alt,
  className = '',
  fill = false,
  width,
  height,
  sizes,
  priority = false
}: ArticleImageProps) {
  // Verifica se a imagem é da pasta article-images
  const isArticleImage = src && src.includes('/article-images/');

  // Usa tag img nativa para imagens da pasta article-images
  if (isArticleImage) {
    if (fill) {
      return (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${className}`}
        />
      );
    }
    
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
      />
    );
  }

  // Usa o componente Image do Next.js para outras imagens
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={true}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 800}
      height={height || 600}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
} 