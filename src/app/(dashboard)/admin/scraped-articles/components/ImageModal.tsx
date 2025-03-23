'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  alt: string;
}

export default function ImageModal({ isOpen, onClose, imageSrc, alt }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-full p-1 sm:p-2">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="relative w-full h-[80vh]">
          <Image
            src={imageSrc}
            alt={alt}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 