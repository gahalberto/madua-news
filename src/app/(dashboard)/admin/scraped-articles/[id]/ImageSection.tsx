'use client';

import dynamic from 'next/dynamic';

const ImageGallery = dynamic(() => import('./ImageGallery'), { ssr: false });
const MainImage = dynamic(() => import('./MainImage'), { ssr: false });

interface ImageSectionProps {
  mainImagePath: string | null;
  contentImages: Array<{ original_url: string; local_path: string }>;
}

export default function ImageSection({ mainImagePath, contentImages }: ImageSectionProps) {
  return (
    <>
      {mainImagePath && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Imagem Principal</h2>
          <MainImage imagePath={mainImagePath} />
        </div>
      )}

      {contentImages.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Imagens do Conteúdo</h2>
          <ImageGallery images={contentImages} />
        </div>
      )}
    </>
  );
} 