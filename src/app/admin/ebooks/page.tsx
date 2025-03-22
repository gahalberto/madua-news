"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter } from "react-icons/fa";

// Interface para o modelo Ebook
interface Ebook {
  id: string;
  title: string;
  description: string;
  price: number;
  promotionalPrice?: number | null;
  coverImageUrl?: string | null;
  fileUrl: string;
  pages?: number | null;
  language?: string | null;
  isbn?: string | null;
  author?: string | null;
  publisher?: string | null;
  publicationDate?: Date | null;
  format?: string | null;
  featured: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminEbooksPage() {
  const router = useRouter();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [isMounted, setIsMounted] = useState(false);

  // Função para buscar os ebooks do banco de dados
  const fetchEbooks = useCallback(async () => {
    try {
      setLoading(true);
      
      // Construir a URL com os parâmetros de busca e filtro
      let url = `/api/ebooks`;
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
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar ebooks:", error);
      toast.error("Erro ao carregar ebooks");
      setLoading(false);
    }
  }, [searchTerm, currentFilter]);

  useEffect(() => {
    setIsMounted(true);
    if (isMounted) {
      fetchEbooks();
    }
  }, [isMounted, fetchEbooks]);

  // Função para lidar com a mudança na busca
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Função para lidar com a mudança no filtro
  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
  };

  // Função para excluir um ebook
  const handleDeleteEbook = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este e-book?")) {
      try {
        // Fazer a requisição à API
        const response = await fetch(`/api/ebooks?id=${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Erro ao excluir e-book');
        }
        
        // Atualizar a lista de e-books
        setEbooks(ebooks.filter(ebook => ebook.id !== id));
        toast.success("E-book excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir e-book:", error);
        toast.error("Erro ao excluir e-book");
      }
    }
  };

  // Função para editar um ebook
  const handleEditEbook = (id: string) => {
    // Redirecionar para a página de edição
    router.push(`/admin/ebooks/editar/${id}`);
  };

  // Função para adicionar um novo ebook
  const handleAddEbook = () => {
    // Redirecionar para a página de adição
    router.push("/admin/ebooks/adicionar");
  };

  // Filtrar ebooks com base na busca e no filtro atual
  const filteredEbooks = ebooks.filter(ebook => {
    const matchesSearch = ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ebook.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ebook.author?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentFilter === "all") return matchesSearch;
    if (currentFilter === "published") return matchesSearch && ebook.isPublished;
    if (currentFilter === "draft") return matchesSearch && !ebook.isPublished;
    if (currentFilter === "featured") return matchesSearch && ebook.featured;
    
    return matchesSearch;
  });

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar E-books</h1>
        <button
          onClick={handleAddEbook}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" /> Adicionar E-book
        </button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Buscar e-books..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-400" />
          <select
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            value={currentFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="published">Publicados</option>
            <option value="draft">Rascunhos</option>
            <option value="featured">Destaque</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p className="mt-2 text-gray-600">Carregando e-books...</p>
        </div>
      ) : filteredEbooks.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Nenhum e-book encontrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">E-book</th>
                <th scope="col" className="px-6 py-3">Autor</th>
                <th scope="col" className="px-6 py-3">Preço</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEbooks.map((ebook) => (
                <tr key={ebook.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center">
                    {ebook.coverImageUrl && (
                      <div className="w-12 h-16 relative mr-3 flex-shrink-0">
                        <Image
                          src={ebook.coverImageUrl}
                          alt={ebook.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{ebook.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{ebook.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{ebook.author || "N/A"}</td>
                  <td className="px-6 py-4">
                    {ebook.promotionalPrice ? (
                      <div>
                        <span className="line-through text-gray-400 mr-2">
                          {formatPrice(ebook.price)}
                        </span>
                        <span className="text-green-600 font-medium">
                          {formatPrice(ebook.promotionalPrice)}
                        </span>
                      </div>
                    ) : (
                      formatPrice(ebook.price)
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      ebook.isPublished 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {ebook.isPublished ? "Publicado" : "Rascunho"}
                    </span>
                    {ebook.featured && (
                      <span className="ml-2 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Destaque
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditEbook(ebook.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteEbook(ebook.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 