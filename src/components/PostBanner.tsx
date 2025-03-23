'use client';

import Image from 'next/image';

interface PostBannerProps {
  title: string;
  imageUrl: string | null;
}

export function PostBanner({ title, imageUrl }: PostBannerProps) {
  // Versão simplificada do banner sem geração dinâmica
  return (
    <div className="relative aspect-square w-full max-w-2xl mx-auto rounded-lg overflow-hidden bg-gradient-to-b from-indigo-500 to-purple-600">
      {imageUrl && (
        <div className="absolute inset-0 opacity-50">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <h2 className="text-3xl md:text-4xl text-white font-bold text-center drop-shadow-lg">
          {title}
        </h2>
      </div>
    </div>
  );
} 