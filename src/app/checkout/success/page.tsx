"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, BookOpen, Laptop } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  type: 'course' | 'ebook';
}

interface OrderDetails {
  orderId: string;
  status: string;
  total: number;
  items: OrderItem[];
}

// Componente que usa useSearchParams
function CheckoutSuccessContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const sessionId = searchParams.get("session_id");
  
  useEffect(() => {
    setIsMounted(true);
    
    if (!sessionId) {
      router.push("/");
      return;
    }
    
    // Limpar o carrinho após o pagamento bem-sucedido
    if (isMounted) {
      localStorage.setItem('cart', JSON.stringify([]));
    }
    
    // Verificar o status da sessão
    const verifySession = async () => {
      try {
        const response = await fetch(`/api/checkout/verify?session_id=${sessionId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Falha ao verificar o pagamento");
        }
        
        const data = await response.json();
        setOrderDetails(data);
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        setError(error instanceof Error ? error.message : "Erro ao verificar o pagamento");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isMounted) {
      verifySession();
    }
  }, [sessionId, router, isMounted]);
  
  // Renderizar um placeholder durante a renderização do servidor
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Verificando Pagamento...</h1>
            </div>
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Pagamento Confirmado!</h1>
            <p className="text-gray-600">
              Seu pedido foi processado com sucesso.
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
              <p className="font-medium">Ocorreu um erro:</p>
              <p>{error}</p>
              <div className="mt-4">
                <Link href="/checkout" className="text-blue-600 hover:underline">
                  Voltar para o checkout
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-t border-b border-gray-200 py-4">
                <h2 className="text-lg font-semibold mb-3">Detalhes do Pedido</h2>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Número do Pedido:</span> {orderDetails?.orderId || "N/A"}
                </p>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Status:</span>{" "}
                  <span className="text-green-600 font-medium">
                    {orderDetails?.status === "PAID" ? "Pago" : 
                     orderDetails?.status === "PENDING" ? "Pendente" : 
                     orderDetails?.status === "CANCELLED" ? "Cancelado" : 
                     orderDetails?.status === "SHIPPED" ? "Enviado" : 
                     orderDetails?.status === "DELIVERED" ? "Entregue" : "Processando"}
                  </span>
                </p>
                <p className="text-gray-700 mb-3">
                  <span className="font-medium">Data:</span>{" "}
                  {new Intl.DateTimeFormat("pt-BR").format(new Date())}
                </p>
                <p className="text-gray-700 font-medium">
                  Total: {" "}
                  <span className="text-green-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(orderDetails?.total || 0)}
                  </span>
                </p>
              </div>
              
              {orderDetails?.items && orderDetails.items.length > 0 && (
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold mb-3">Itens Adquiridos</h2>
                  <ul className="space-y-3">
                    {orderDetails.items.map((item) => (
                      <li key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                        <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-md">
                          {item.type === 'course' ? (
                            <Laptop className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.title}</p>
                          <div className="flex justify-between mt-1">
                            <span className="text-sm text-gray-500">
                              {item.type === 'course' ? 'Curso' : 'E-book'}
                            </span>
                            <span className="text-sm font-medium">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(item.price)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Você receberá um e-mail com os detalhes da sua compra.
                </p>
                
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/dashboard/cursos"
                    className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Meus Cursos <Laptop className="ml-2 w-4 h-4" />
                  </Link>
                  
                  <Link
                    href="/dashboard/ebooks"
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Meus E-books <BookOpen className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente principal exportado envolto em Suspense
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Carregando detalhes do pagamento...</h1>
            </div>
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
} 