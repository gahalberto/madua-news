'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface BannerPreviewProps {
  title: string;
  imageUrl: string;
}

export function BannerPreview({ title, imageUrl }: BannerPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function generatePreview() {
      if (!title || !imageUrl) {
        console.log('Faltando dados para preview:', { title, imageUrl });
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log('Iniciando geração do preview:', { title, imageUrl });

        // Fazer a requisição para gerar o banner
        const response = await fetch('/api/generate-banner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, imageUrl }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Erro na resposta da API:', { status: response.status, data });
          throw new Error(data.error || 'Falha ao gerar preview');
        }

        console.log('Preview gerado com sucesso:', data);
        setPreviewUrl(data.bannerUrl);
      } catch (error) {
        console.error('Erro detalhado ao gerar preview:', {
          error,
          message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        setError(error instanceof Error ? error.message : 'Erro ao gerar preview');
        setPreviewUrl(null);
      } finally {
        setIsLoading(false);
      }
    }

    // Resetar estado quando as props mudam
    setPreviewUrl(null);
    setError(null);

    if (title && imageUrl) {
      generatePreview();
    }
  }, [title, imageUrl]);

  if (error) {
    return (
      <div className="w-full aspect-square bg-red-50 rounded-lg flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-red-500 hover:text-red-700 underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !previewUrl) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Gerando preview...</p>
          <p className="text-sm text-gray-400 mt-1">
            {title ? 'Processando imagem...' : 'Aguardando título...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square">
      <Image
        src={previewUrl}
        alt="Preview do banner"
        fill
        className="rounded-lg object-cover"
      />
    </div>
  );
} 