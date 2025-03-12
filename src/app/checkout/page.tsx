"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ShoppingBag, AlertCircle, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface CartItem {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  type: 'course' | 'ebook';
  quantity: number;
  coverImageUrl?: string;
}

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { status } = useSession();
  const router = useRouter();

  // Carregar itens do carrinho do localStorage
  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          // Garantir que todos os itens tenham as propriedades necessárias
          const validatedCart = parsedCart.map((item: {
            id: string;
            title: string;
            price: number;
            imageUrl?: string;
            type?: 'course' | 'ebook';
            quantity?: number;
            coverImageUrl?: string;
          }) => ({
            ...item,
            type: item.type || 'ebook', // Definir um valor padrão se não existir
            quantity: item.quantity || 1,
            coverImageUrl: item.coverImageUrl || item.imageUrl
          }));
          setItems(validatedCart);
        } catch (error) {
          console.error("Erro ao carregar carrinho:", error);
          setItems([]);
        }
      }
    };
    
    loadCart();
    
    // Adicionar listener para atualizar o carrinho quando mudar em outra aba/janela
    const handleStorageChange = () => loadCart();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Calcular o total
  const totalPrice = items.reduce((total, item) => total + item.price, 0);

  // Remover item do carrinho
  const removeItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  // Limpar o carrinho
  const clearCart = () => {
    setItems([]);
    localStorage.setItem('cart', JSON.stringify([]));
  };

  // Processar o checkout
  const handleCheckout = async () => {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/checkout&message=Você precisa fazer login para finalizar sua compra`);
      return;
    }

    if (items.length === 0) {
      toast.error("Seu carrinho está vazio");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Criar sessão de checkout do Stripe
      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao processar o pagamento");
      }

      const { url } = await response.json();
      
      // Redirecionar para o checkout do Stripe
      window.location.href = url;
    } catch (error: unknown) {
      console.error("Erro no checkout:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar o pagamento";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirecionar se o carrinho estiver vazio
  useEffect(() => {
    if (items.length === 0 && !isLoading) {
      const timer = setTimeout(() => {
        router.push("/cursos");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [items, router, isLoading]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Carrinho de compras</h1>
            <Link href="/cursos" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Continuar comprando
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 mb-4">Seu carrinho está vazio</p>
              <Link 
                href="/cursos" 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Ver cursos
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.id} className="p-4 flex items-start gap-4">
                    <div className="w-20 h-16 relative bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <Image 
                          src={item.imageUrl} 
                          alt={item.title} 
                          fill 
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xs text-gray-400">Sem imagem</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-indigo-600 font-bold mt-1">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(item.price)}
                      </p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="p-4 border-t border-gray-200 bg-gray-50 text-right">
                <button 
                  onClick={clearCart}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpar carrinho
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="md:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Resumo da compra</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totalPrice)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-3">
                <span>Total</span>
                <span className="text-indigo-600">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totalPrice)}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {status === "unauthenticated" && (
              <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md mb-4 text-sm">
                Você precisa estar logado para finalizar a compra.
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isLoading || items.length === 0}
              className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? "Processando..." 
                : status === "unauthenticated" 
                  ? "Fazer login e finalizar" 
                  : "Finalizar compra"}
            </button>
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              Pagamento processado com segurança via Stripe
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 