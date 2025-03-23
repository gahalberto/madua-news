'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
  articleId: string;
}

export function DeleteButton({ articleId }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    // Confirmar antes de excluir
    if (!window.confirm('Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/scraped-articles/${articleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir artigo');
      }

      toast.success('Artigo excluído com sucesso!');
      router.refresh(); // Atualizar a página para refletir a exclusão
    } catch (error) {
      console.error('Erro ao excluir artigo:', error);
      toast.error(`Erro ao excluir artigo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center px-2.5 py-1 text-xs rounded-md text-white bg-red-500 hover:bg-red-600 transition-colors"
      title="Excluir artigo"
    >
      <svg
        className="w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        ></path>
      </svg>
      Excluir
    </button>
  );
} 