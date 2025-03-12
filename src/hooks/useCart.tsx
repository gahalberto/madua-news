"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Interface para os itens do carrinho
export interface CartItem {
  id: string;
  type: 'course' | 'ebook';
  title: string;
  price: number;
  coverImageUrl: string;
  quantity: number;
}

// Interface para o contexto do carrinho
interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

// Criando o contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider do carrinho
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar o carrinho do localStorage quando o componente montar
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (error) {
        console.error("Erro ao carregar o carrinho:", error);
        setItems([]);
      }
    }
    setIsInitialized(true);
  }, []);

  // Salvar o carrinho no localStorage quando ele mudar
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(items));
      
      // Disparar evento para atualizar outros componentes que usam o carrinho
      window.dispatchEvent(new Event('storage'));
    }
  }, [items, isInitialized]);

  // Adicionar item ao carrinho
  const addToCart = (item: CartItem) => {
    setItems(prevItems => {
      // Verificar se o item já existe no carrinho
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id && i.type === item.type);
      
      if (existingItemIndex >= 0) {
        // Se o item já existe, atualizar a quantidade
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += item.quantity;
        return updatedItems;
      } else {
        // Se o item não existe, adicionar ao carrinho
        return [...prevItems, item];
      }
    });
  };

  // Remover item do carrinho
  const removeFromCart = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Atualizar quantidade de um item
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Limpar o carrinho
  const clearCart = () => {
    setItems([]);
  };

  // Calcular o total de itens no carrinho
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // Calcular o preço total do carrinho
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook para usar o carrinho
export function useCart() {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  
  return context;
} 