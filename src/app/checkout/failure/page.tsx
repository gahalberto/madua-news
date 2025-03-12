"use client";

import { AlertOctagon } from "lucide-react";
import Link from "next/link";

export default function CheckoutFailurePage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertOctagon className="h-12 w-12 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Houve um problema com o pagamento</h1>
        <p className="text-gray-600 mb-6">
          Não se preocupe! Seu carrinho continua salvo e você pode tentar novamente.
        </p>
        
        <div className="space-y-3">
          <Link 
            href="/checkout" 
            className="block w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Voltar para o checkout
          </Link>
          
          <Link 
            href="/cursos" 
            className="block w-full py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
} 