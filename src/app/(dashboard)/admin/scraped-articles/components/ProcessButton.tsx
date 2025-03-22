'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProcessButtonProps {
  articleId: string;
  onSuccess?: (postId: string) => void;
}

export function ProcessButton({ articleId, onSuccess }: ProcessButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleProcess = async () => {
    try {
      setIsLoading(true);
      toast.info('Enviando artigo para tradução com DeepSeek...');
      
      const response = await fetch('/api/admin/scraped-articles/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar artigo');
      }

      toast.success('Artigo traduzido e publicado com sucesso!');
      
      if (onSuccess && data.post && data.post.id) {
        onSuccess(data.post.id);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao processar artigo');
      console.error('Erro ao processar artigo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleProcess} 
      disabled={isLoading} 
      variant="default"
      size="sm"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Traduzindo com IA...
        </>
      ) : (
        'Traduzir e Publicar'
      )}
    </Button>
  );
} 