'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageModal from '../components/ImageModal';

interface ImageGalleryProps {
  images: Array<{ original_url: string; local_path: string }>;
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleOpenImage = (imagePath: string) => {
    setSelectedImage(imagePath);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, index) => (
          <div 
            key={index} 
            className="relative w-full h-40 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => handleOpenImage(img.local_path)}
          >
            <Image
              src={img.local_path}
              alt={`Imagem ${index+1} do artigo`}
              fill
              className="object-contain hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              unoptimized
            />
          </div>
        ))}
      </div>
      
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={handleCloseModal}
          imageSrc={selectedImage}
          alt="Imagem do artigo em tamanho completo"
        />
      )}
    </>
  );
} 