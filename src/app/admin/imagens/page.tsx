'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { formatBytes, formatDate } from '@/lib/utils';

interface ImageItem {
  name: string;
  path: string;
  url: string;
  size: number;
  lastModified: string;
}

export default function AdminImagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [copying, setCopying] = useState(false);

  // Redirecionar se não estiver autenticado ou não for admin
  useEffect(() => {
    if (status === 'unauthenticated' || (session?.user?.role !== 'ADMIN' && status === 'authenticated')) {
      router.push('/');
    }
  }, [session, status, router]);

  // Carregar imagens
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchImages();
    }
  }, [session, status, search, selectedFolder]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedFolder) params.append('folder', selectedFolder);
      
      const response = await fetch(`/api/admin/images?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Falha ao carregar imagens');
      }
      
      const data = await response.json();
      setImages(data.images);
      setFolders(data.folders);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(text);
      setTimeout(() => setCopying(false), 1500);
    } catch (error) {
      console.error('Erro ao copiar para o clipboard:', error);
      setCopying(false);
    }
  };

  // Renderizador de loading
  if (status === 'loading' || (status === 'authenticated' && session?.user?.role !== 'ADMIN')) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gerenciador de Imagens</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(12).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square relative">
                <Skeleton className="w-full h-full absolute" />
              </div>
              <CardContent className="p-3">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Redirecionando...
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciador de Imagens</h1>
      
      {/* Filtros e busca */}
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-6">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Pesquisar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="w-full md:w-1/3">
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar pasta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as pastas</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder} value={folder}>
                  {folder}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 flex justify-end">
          <Button onClick={fetchImages}>
            Atualizar
          </Button>
        </div>
      </div>
      
      {/* Estatísticas */}
      <div className="mb-6">
        <Badge variant="outline" className="text-sm">
          {images.length} imagens encontradas
        </Badge>
      </div>
      
      {/* Grid de imagens */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square relative">
                <Skeleton className="w-full h-full absolute" />
              </div>
              <CardContent className="p-3">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {images.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900">Nenhuma imagem encontrada</h3>
              <p className="mt-2 text-sm text-gray-500">
                Tente ajustar os filtros ou buscar por outro termo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.map((image) => (
                <Card 
                  key={image.path} 
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="aspect-square relative">
                    <Image
                      src={image.url}
                      alt={image.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm truncate" title={image.name}>
                      {image.name}
                    </h3>
                    <p className="text-xs text-gray-500 flex justify-between mt-1">
                      <span>{formatBytes(image.size)}</span>
                      <span>{formatDate(new Date(image.lastModified))}</span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Modal de detalhes da imagem */}
      <Dialog open={!!selectedImage} onOpenChange={(open: boolean) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative aspect-square w-full">
              {selectedImage && (
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">URL da imagem</h3>
                <div className="mt-1 flex">
                  <Input
                    readOnly
                    value={`${process.env.NEXT_PUBLIC_APP_URL || ''}${selectedImage?.url}`}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => selectedImage && copyToClipboard(`${process.env.NEXT_PUBLIC_APP_URL || ''}${selectedImage.url}`)}
                    className="ml-2"
                    variant="outline"
                  >
                    {copying ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Caminho</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedImage?.path}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tamanho</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedImage && formatBytes(selectedImage.size)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Última modificação</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedImage && formatDate(new Date(selectedImage.lastModified))}</p>
              </div>
              
              <div className="pt-4">
                <a 
                  href={selectedImage?.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Abrir imagem em nova aba
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 