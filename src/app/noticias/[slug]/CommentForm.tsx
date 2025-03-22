"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function CommentForm({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!session) {
      toast.error("Você precisa estar logado para comentar");
      return;
    }
    
    if (!comment.trim()) {
      toast.error("O comentário não pode estar vazio");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao adicionar comentário");
      }
      
      toast.success("Comentário adicionado com sucesso!");
      setComment("");
      router.refresh(); // Atualizar a página para mostrar o novo comentário
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao adicionar comentário");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Deixe seu comentário</h3>
      {session ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Comentário
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Escreva seu comentário aqui..."
              required
              disabled={isSubmitting}
            ></textarea>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar comentário"}
          </button>
        </form>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">
            Você precisa estar logado para deixar um comentário.
          </p>
          <a
            href="/login?callbackUrl=/blog"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Fazer login
          </a>
        </div>
      )}
    </div>
  );
} 