'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RotateCw, Download } from 'lucide-react';

export function RunScraperButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRunScraper = async () => {
    try {
      setIsLoading(true);
      toast.info('Iniciando o scraper. Este processo pode levar alguns minutos...');
      
      const response = await fetch('/api/admin/scraper/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao executar o scraper');
      }

      // Mostrar mensagem de sucesso com detalhes
      toast.success(data.message);
      
      // Se tiver estatísticas detalhadas, mostrar informações específicas
      if (data.details?.stats) {
        const stats = data.details.stats;
        
        if (stats.saved > 0) {
          toast.success(`${stats.saved} novos artigos foram adicionados.`, { 
            duration: 5000,
            icon: '✅'
          });
        }
        
        if (stats.duplicates > 0) {
          toast.info(`${stats.duplicates} artigos duplicados foram ignorados.`, { 
            duration: 5000,
            icon: 'ℹ️'
          });
        }
        
        if (stats.errors > 0) {
          toast.error(`${stats.errors} artigos tiveram erro ao processar.`, { 
            duration: 5000,
            icon: '⚠️'
          });
        }
      }
      
      // Recarrega a página para mostrar os novos artigos
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao executar o scraper');
      console.error('Erro ao executar o scraper:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleRunScraper} 
      disabled={isLoading} 
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
    >
      {isLoading ? (
        <>
          <RotateCw className="h-4 w-4 mr-1 animate-spin" />
          Processando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-1" />
          Executar Scraper
        </>
      )}
    </Button>
  );
} 