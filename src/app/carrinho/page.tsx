"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Função para iniciar o checkout
  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Seu carrinho está vazio");
      return;
    }

    try {
      setIsProcessing(true);
      
      // Preparar os dados para o checkout
      const checkoutData = {
        items: items.map(item => ({
          id: item.id,
          type: item.type,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      // Enviar os dados para a API de checkout
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao processar o checkout');
      }
      
      const data = await response.json();
      
      // Redirecionar para a página de pagamento do Mercado Pago
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('URL de checkout não encontrada');
      }
    } catch (error) {
      console.error("Erro ao processar o checkout:", error);
      toast.error("Erro ao processar o checkout. Por favor, tente novamente.");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-lg mx-auto">
          <FaShoppingCart className="text-gray-300 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mb-8">Você ainda não adicionou nenhum item ao seu carrinho.</p>
          <Link
            href="/ebooks"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg inline-flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Explorar E-books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Seu Carrinho</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lista de itens do carrinho */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Itens do Carrinho ({totalItems})</h2>
            </div>
            
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative h-24 w-16 flex-shrink-0">
                    {item.coverImageUrl ? (
                      <Image
                        src={item.coverImageUrl}
                        alt={item.title}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded">
                        <span className="text-gray-400 text-xs">Sem capa</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {item.type === 'ebook' ? 'E-book' : 'Curso'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-gray-500 hover:text-gray-700 p-1"
                          aria-label="Diminuir quantidade"
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="mx-2 w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-500 hover:text-gray-700 p-1"
                          aria-label="Aumentar quantidade"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label="Remover item"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-gray-800 font-medium">
                      {formatPrice(item.price)}
                    </span>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-500">
                        {formatPrice(item.price)} cada
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="p-4 border-t flex justify-between">
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
              >
                <FaTrash className="mr-1" /> Limpar Carrinho
              </button>
              <Link
                href="/ebooks"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                <FaArrowLeft className="mr-1" /> Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
        
        {/* Resumo do pedido */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Desconto</span>
                <span>{formatPrice(0)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-blue-600">{formatPrice(totalPrice)}</span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-50"
            >
              {isProcessing ? "Processando..." : "Finalizar Compra"}
            </button>
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>Pagamento processado com segurança pelo Mercado Pago</p>
              <p className="mt-1">Ao finalizar a compra, você concorda com nossos termos de serviço.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 