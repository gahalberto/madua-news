"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface EnrollButtonProps {
  courseId: string;
  courseTitle: string;
  coursePrice: number | null;
  coursePromotionalPrice?: number | null;
  courseImage?: string | null;
  className?: string;
}

export default function EnrollButton({
  courseId,
  courseTitle,
  coursePrice,
  coursePromotionalPrice,
  courseImage,
  className = ""
}: EnrollButtonProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Determinar o preço final (promocional ou normal)
  const finalPrice = coursePromotionalPrice !== undefined && coursePromotionalPrice !== null 
    ? coursePromotionalPrice 
    : coursePrice;

  const handleEnroll = async () => {
    // Se não estiver logado, salvar no localStorage e redirecionar para login
    if (!session) {
      // Salvar o curso no localStorage para recuperar depois do login
      const cartItem = {
        id: courseId,
        title: courseTitle,
        price: finalPrice || 0,
        originalPrice: coursePrice,
        promotionalPrice: coursePromotionalPrice,
        imageUrl: courseImage || ""
      };
      
      // Salvar no carrinho
      const currentCart = localStorage.getItem('cart');
      const cart = currentCart ? JSON.parse(currentCart) : [];
      
      // Verificar se o item já está no carrinho
      if (!cart.some((item: any) => item.id === courseId)) {
        cart.push(cartItem);
        localStorage.setItem('cart', JSON.stringify(cart));
      }
      
      // Redirecionar para login com callback para checkout
      toast.success("Curso adicionado ao carrinho!");
      router.push(`/login?callbackUrl=/checkout&message=Faça login para finalizar sua compra`);
      return;
    }

    // Se for um curso gratuito
    if (!finalPrice || finalPrice === 0) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/courses/${courseId}/enroll`, {
          method: "POST",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Erro ao realizar matrícula");
        }

        toast.success("Matrícula realizada com sucesso!");
        router.refresh();
        router.push(`/cursos/${courseId}/aulas`);
      } catch (error: any) {
        toast.error(error.message || "Erro ao realizar matrícula");
      } finally {
        setIsLoading(false);
      }
    } 
    // Se for um curso pago
    else {
      // Adicionar ao carrinho e ir para checkout
      const cartItem = {
        id: courseId,
        title: courseTitle,
        price: finalPrice,
        originalPrice: coursePrice,
        promotionalPrice: coursePromotionalPrice,
        imageUrl: courseImage || ""
      };
      
      // Salvar no carrinho
      const currentCart = localStorage.getItem('cart');
      const cart = currentCart ? JSON.parse(currentCart) : [];
      
      // Verificar se o item já está no carrinho
      if (!cart.some((item: any) => item.id === courseId)) {
        cart.push(cartItem);
        localStorage.setItem('cart', JSON.stringify(cart));
        toast.success("Curso adicionado ao carrinho!");
      }
      
      // Redirecionar para checkout
      router.push("/checkout");
    }
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={isLoading}
      className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading 
        ? "Processando..." 
        : !finalPrice || finalPrice === 0 
          ? "Matricular-se gratuitamente" 
          : "Matricular-se agora"}
    </button>
  );
} 