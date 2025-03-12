"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  createdAt: string;
  orderCount: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");

  // Simulação de dados para demonstração
  useEffect(() => {
    // Em um ambiente real, esses dados viriam de uma API
    const mockProducts: Product[] = [
      {
        id: "1",
        name: "Livro: JavaScript Avançado",
        description: "Um guia completo sobre JavaScript moderno e suas aplicações",
        price: 89.90,
        stock: 45,
        imageUrl: "https://example.com/product1.jpg",
        createdAt: "2023-10-15",
        orderCount: 28,
      },
      {
        id: "2",
        name: "Curso Completo de UX/UI Design",
        description: "Aprenda a criar interfaces incríveis com este curso completo",
        price: 249.90,
        stock: 999,
        imageUrl: "https://example.com/product2.jpg",
        createdAt: "2023-10-10",
        orderCount: 56,
      },
      {
        id: "3",
        name: "Template de Portfolio para Desenvolvedores",
        description: "Template profissional para destacar seus projetos e habilidades",
        price: 49.90,
        stock: 999,
        imageUrl: "https://example.com/product3.jpg",
        createdAt: "2023-10-05",
        orderCount: 112,
      },
      {
        id: "4",
        name: "Kit de Ícones para Aplicações Web",
        description: "Mais de 1000 ícones em diversos formatos para suas aplicações",
        price: 29.90,
        stock: 999,
        imageUrl: "https://example.com/product4.jpg",
        createdAt: "2023-09-28",
        orderCount: 87,
      },
      {
        id: "5",
        name: "Livro: Algoritmos e Estruturas de Dados",
        description: "Aprenda os fundamentos da programação com exemplos práticos",
        price: 79.90,
        stock: 32,
        imageUrl: "https://example.com/product5.jpg",
        createdAt: "2023-09-20",
        orderCount: 41,
      },
    ];

    setProducts(mockProducts);
    setIsLoading(false);
  }, []);

  // Filtrar produtos com base no termo de pesquisa e filtro atual
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentFilter === "all") return matchesSearch;
    if (currentFilter === "inStock") return matchesSearch && product.stock > 0;
    if (currentFilter === "outOfStock") return matchesSearch && product.stock === 0;
    if (currentFilter === "digital") return matchesSearch && product.stock === 999; // Assumindo que 999 é usado para produtos digitais
    
    return matchesSearch;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
  };

  const handleDeleteProduct = (id: string) => {
    // Em um ambiente real, isso seria uma chamada de API
    setProducts(products.filter(product => product.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gerenciar Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Adicionar Produto
        </Link>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-3 py-1 rounded-md ${
                currentFilter === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => handleFilterChange("inStock")}
              className={`px-3 py-1 rounded-md ${
                currentFilter === "inStock"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Em Estoque
            </button>
            <button
              onClick={() => handleFilterChange("outOfStock")}
              className={`px-3 py-1 rounded-md ${
                currentFilter === "outOfStock"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Sem Estoque
            </button>
            <button
              onClick={() => handleFilterChange("digital")}
              className={`px-3 py-1 rounded-md ${
                currentFilter === "digital"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Digitais
            </button>
          </div>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Pesquisar produtos..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Produto
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Preço
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estoque
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Vendas
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Data de Criação
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.imageUrl && (
                          <div className="flex-shrink-0 h-10 w-10 mr-4">
                            <div className="h-10 w-10 rounded-md bg-gray-200"></div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description.substring(0, 100)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.stock === 999 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          Digital
                        </span>
                      ) : product.stock > 0 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {product.stock} unidades
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Sem estoque
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.orderCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/produtos/${product.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Nenhum produto encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 