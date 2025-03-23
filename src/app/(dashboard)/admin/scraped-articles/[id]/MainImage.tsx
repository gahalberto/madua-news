'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageModal from '../components/ImageModal';

interface MainImageProps {
  imagePath: string;
}

export default function MainImage({ imagePath }: MainImageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        className="relative w-full h-64 rounded-lg overflow-hidden cursor-pointer"
        onClick={handleOpenModal}
      >
        <Image
          src={imagePath}
          alt="Imagem principal do artigo"
          fill
          className="object-contain hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <span className="text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg text-sm font-medium">
            Clique para ampliar
          </span>
        </div>
      </div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        imageSrc={imagePath}
        alt="Imagem principal do artigo em tamanho completo"
      />
    </>
  );
} 