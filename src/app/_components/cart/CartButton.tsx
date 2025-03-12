"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CartItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  promotionalPrice?: number | null;
  imageUrl: string;
}

export default function CartButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Carregar itens do carrinho
  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    };
    
    // Carregar ao montar o componente
    loadCart();
    
    // Adicionar um event listener para atualizar o carrinho quando ele mudar
    window.addEventListener('storage', loadCart);
    
    // Limpar o event listener
    return () => {
      window.removeEventListener('storage', loadCart);
    };
  }, []);
  
  // Calcular o total
  const totalPrice = items.reduce((total, item) => total + item.price, 0);
  const itemCount = items.length;
  
  // Remover item do carrinho
  const removeItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
    // Disparar evento para outros componentes saberem que o carrinho mudou
    window.dispatchEvent(new Event('storage'));
  };
  
  // Limpar o carrinho
  const clearCart = () => {
    setItems([]);
    localStorage.setItem('cart', JSON.stringify([]));
    // Disparar evento para outros componentes saberem que o carrinho mudou
    window.dispatchEvent(new Event('storage'));
  };

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors"
      >
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium">Carrinho</h3>
            <button onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-4">
            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Seu carrinho está vazio</p>
            ) : (
              <>
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="w-16 h-12 relative bg-gray-100 rounded overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-400">Sem imagem</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium line-clamp-1">{item.title}</h4>
                      {item.promotionalPrice !== undefined && item.promotionalPrice !== null && item.originalPrice ? (
                        <div>
                          <p className="text-gray-500 line-through text-xs">
                            {formatPrice(item.originalPrice)}
                          </p>
                          <p className="text-indigo-600 font-medium">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-indigo-600 font-medium">
                          {formatPrice(item.price)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-indigo-600">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Limpar
                </button>
                <Link
                  href="/checkout"
                  className="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Finalizar compra
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 