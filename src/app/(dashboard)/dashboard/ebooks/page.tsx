"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, BookOpen, AlertCircle, Search } from "lucide-react";

interface Ebook {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  fileUrl: string;
  author: string;
  purchaseDate: string;
}

export default function EbooksPage() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const fetchEbooks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/user/ebooks");
        
        if (!response.ok) {
          throw new Error("Falha ao carregar e-books");
        }
        
        const data = await response.json();
        setEbooks(data);
        setError(null);
      } catch (error) {
        console.error("Erro ao buscar e-books:", error);
        setError("Não foi possível carregar seus e-books. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isMounted) {
      fetchEbooks();
    }
  }, [isMounted]);

  // Filtrar e-books com base no termo de pesquisa
  const filteredEbooks = ebooks.filter(ebook => 
    ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ebook.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Renderizar um placeholder durante a renderização do servidor
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Meus E-books</h1>
        </div>
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Meus E-books</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Biblioteca Digital
          </span>
        </div>
      </div>

      {/* Barra de pesquisa */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
          placeholder="Pesquisar e-books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error && ebooks.length === 0 ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erro ao carregar e-books</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : filteredEbooks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum e-book encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Nenhum e-book corresponde à sua pesquisa." : "Você ainda não adquiriu nenhum e-book."}
          </p>
          <div className="mt-6">
            <Link
              href="/ebooks"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Explorar e-books disponíveis
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEbooks.map((ebook) => (
            <div key={ebook.id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
              <div className="relative h-48 w-full bg-gray-200">
                {ebook.coverImageUrl ? (
                  <Image
                    src={ebook.coverImageUrl}
                    alt={ebook.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{ebook.title}</h3>
                <p className="text-sm text-gray-500 mb-2">Autor: {ebook.author}</p>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{ebook.description}</p>
                <p className="text-xs text-gray-500 mb-4">
                  Adquirido em: {ebook.purchaseDate}
                </p>
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <a
                  href={`/api/user/ebooks/download/${ebook.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar E-book
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 