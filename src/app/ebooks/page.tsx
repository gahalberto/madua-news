"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaSearch, FaFilter, FaStar, FaBook, FaArrowRight } from "react-icons/fa";

// Interface para o modelo Ebook
interface Ebook {
  id: string;
  title: string;
  description: string;
  price: number;
  promotionalPrice?: number | null;
  coverImageUrl?: string | null;
  author?: string | null;
  featured: boolean;
  isPublished: boolean;
}

export default function EbookCatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [featuredEbooks, setFeaturedEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [currentFilter, setCurrentFilter] = useState(searchParams.get("filter") || "all");

  // Função para buscar os ebooks
  const fetchEbooks = async () => {
    try {
      setLoading(true);
      
      // Construir a URL com os parâmetros de busca e filtro
      let url = `/api/ebooks/public`;
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (currentFilter !== 'all') {
        params.append('filter', currentFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      // Fazer a requisição à API
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar ebooks');
      }
      
      const data = await response.json();
      setEbooks(data);

      // Buscar ebooks em destaque se não estiver filtrando
      if (currentFilter === 'all' && !searchTerm) {
        const featuredResponse = await fetch(`/api/ebooks/public?filter=featured`);
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          setFeaturedEbooks(featuredData.slice(0, 1)); // Pegar apenas o primeiro ebook em destaque
        }
      } else {
        setFeaturedEbooks([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar ebooks:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEbooks();
  }, [searchTerm, currentFilter]);

  // Função para lidar com a mudança na busca
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Função para lidar com a submissão da busca
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEbooks();
    
    // Atualizar a URL com os parâmetros de busca
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (currentFilter !== 'all') params.append('filter', currentFilter);
    
    router.push(`/ebooks${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // Função para lidar com a mudança no filtro
  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    
    // Atualizar a URL com os parâmetros de filtro
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    params.append('filter', filter);
    
    router.push(`/ebooks${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner principal */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Biblioteca de E-books</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Descubra conhecimento especializado em nossa coleção de e-books cuidadosamente selecionados
            </p>
            
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-white border-0 text-gray-900 text-lg rounded-full focus:ring-2 focus:ring-blue-300 focus:outline-none block w-full pl-12 p-4 shadow-lg"
                placeholder="Buscar e-books por título, autor ou assunto..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button
                type="submit"
                className="absolute right-3 bottom-3 top-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
              >
                Buscar
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filtros e categorias */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-2xl font-bold text-gray-800">
            {searchTerm ? `Resultados para "${searchTerm}"` : 
             currentFilter === 'featured' ? 'E-books em Destaque' :
             currentFilter === 'free' ? 'E-books Gratuitos' :
             currentFilter === 'paid' ? 'E-books Premium' : 'Todos os E-books'}
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
            <FaFilter className="text-gray-400 ml-2" />
            <select
              className="bg-transparent border-0 text-gray-700 text-sm font-medium focus:ring-0 focus:outline-none pr-8"
              value={currentFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="featured">Destaques</option>
              <option value="free">Gratuitos</option>
              <option value="paid">Pagos</option>
            </select>
          </div>
        </div>

        {/* E-book em destaque (se houver e não estiver filtrando) */}
        {featuredEbooks.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <FaStar className="text-yellow-500 mr-2" /> E-book em Destaque
              </h2>
            </div>
            
            {featuredEbooks.map((ebook) => (
              <div key={ebook.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
                <div className="md:flex">
                  <div className="md:w-1/3 relative h-64 md:h-auto">
                    {ebook.coverImageUrl ? (
                      <Image
                        src={ebook.coverImageUrl}
                        alt={ebook.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <FaBook className="text-gray-400 text-4xl" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                      <FaStar className="mr-1" /> Destaque
                    </div>
                  </div>
                  <div className="p-8 md:w-2/3 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{ebook.title}</h3>
                      {ebook.author && (
                        <p className="text-blue-600 mb-4">por {ebook.author}</p>
                      )}
                      <p className="text-gray-600 mb-6 line-clamp-3">{ebook.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        {ebook.price === 0 ? (
                          <span className="text-green-600 font-bold text-xl">Grátis</span>
                        ) : ebook.promotionalPrice ? (
                          <div>
                            <span className="line-through text-gray-400 text-sm mr-2">
                              {formatPrice(ebook.price)}
                            </span>
                            <span className="text-blue-600 font-bold text-xl">
                              {formatPrice(ebook.promotionalPrice)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-blue-600 font-bold text-xl">
                            {formatPrice(ebook.price)}
                          </span>
                        )}
                      </div>
                      <Link 
                        href={`/ebooks/${ebook.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg inline-flex items-center transition-colors"
                      >
                        Ver Detalhes <FaArrowRight className="ml-2" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lista de e-books */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Carregando e-books...</p>
          </div>
        ) : ebooks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <FaBook className="text-gray-300 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum e-book encontrado</h3>
            <p className="text-gray-600 mb-6">Tente ajustar seus filtros ou termos de busca</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentFilter('all');
                router.push('/ebooks');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg inline-flex items-center transition-colors"
            >
              Ver todos os e-books
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ebooks.map((ebook) => (
              <Link href={`/ebooks/${ebook.id}`} key={ebook.id} className="group">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-lg h-full flex flex-col">
                  <div className="relative h-64 w-full">
                    {ebook.coverImageUrl ? (
                      <Image
                        src={ebook.coverImageUrl}
                        alt={ebook.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <FaBook className="text-gray-400 text-4xl" />
                      </div>
                    )}
                    {ebook.featured && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                        <FaStar className="mr-1" /> Destaque
                      </div>
                    )}
                    {ebook.price === 0 && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Grátis
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{ebook.title}</h3>
                    {ebook.author && (
                      <p className="text-sm text-blue-600 mb-2">por {ebook.author}</p>
                    )}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{ebook.description}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <div>
                        {ebook.price === 0 ? (
                          <span className="text-green-600 font-bold">Grátis</span>
                        ) : ebook.promotionalPrice ? (
                          <div>
                            <span className="line-through text-gray-400 text-xs mr-1">
                              {formatPrice(ebook.price)}
                            </span>
                            <span className="text-blue-600 font-bold">
                              {formatPrice(ebook.promotionalPrice)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-blue-600 font-bold">
                            {formatPrice(ebook.price)}
                          </span>
                        )}
                      </div>
                      <span className="text-blue-600 font-medium group-hover:text-blue-800 inline-flex items-center">
                        Ver Detalhes
                        <FaArrowRight className="ml-1 text-xs group-hover:ml-2 transition-all" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 