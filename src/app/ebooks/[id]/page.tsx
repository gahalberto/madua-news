"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { 
  FaStar, FaShoppingCart, FaDownload, FaBook, FaLanguage, 
  FaCalendarAlt, FaUser, FaBuilding, FaArrowLeft, FaShare,
  FaCheckCircle, FaInfoCircle, FaFileAlt, FaBookmark, FaArrowRight
} from "react-icons/fa";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import { useCart } from "@/hooks/useCart";

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
  publicationDate?: string | null;
  format?: string | null;
  featured: boolean;
  isPublished: boolean;
}

export default function EbookDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'details'>('description');

  // Função para buscar os dados do e-book
  const fetchEbookData = async () => {
    try {
      setLoading(true);
      
      // Fazer a requisição à API
      const response = await fetch(`/api/ebooks/public/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do e-book');
      }
      
      const data = await response.json();
      setEbook(data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar dados do e-book:", error);
      toast.error("Erro ao carregar dados do e-book");
      setLoading(false);
      router.push("/ebooks");
    }
  };

  useEffect(() => {
    if (params && params.id) {
      fetchEbookData();
    }
  }, [params]);

  // Formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Função para adicionar ao carrinho
  const handleAddToCart = () => {
    if (!ebook) return;
    
    addToCart({
      id: ebook.id,
      type: 'ebook',
      title: ebook.title,
      price: ebook.promotionalPrice || ebook.price,
      coverImageUrl: ebook.coverImageUrl || '',
      quantity: 1
    });
    
    toast.success("E-book adicionado ao carrinho!");
  };

  // Função para abrir o modal de captura de leads
  const handleGetFreeEbook = () => {
    setShowLeadModal(true);
  };

  // Função para processar o formulário de captura de leads
  const handleLeadSubmit = async (leadData: { name: string; email: string; phone?: string }) => {
    try {
      // Enviar dados do lead para a API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...leadData,
          ebookId: ebook?.id,
          ebookTitle: ebook?.title
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao processar seu pedido');
      }
      
      // Fechar o modal
      setShowLeadModal(false);
      
      // Mostrar mensagem de sucesso
      toast.success("Parabéns! Seu e-book gratuito está disponível para download.");
      
      // Redirecionar para a página de download
      if (ebook?.fileUrl) {
        window.open(ebook.fileUrl, '_blank');
      }
    } catch (error) {
      console.error("Erro ao processar lead:", error);
      toast.error("Erro ao processar seu pedido. Por favor, tente novamente.");
    }
  };

  // Função para compartilhar o e-book
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: ebook?.title || 'E-book',
        text: `Confira este e-book: ${ebook?.title}`,
        url: window.location.href,
      })
      .then(() => console.log('Compartilhado com sucesso'))
      .catch((error) => console.log('Erro ao compartilhar', error));
    } else {
      // Fallback para navegadores que não suportam a API Web Share
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-16">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Carregando E-book</h2>
          <p className="text-gray-600">Aguarde enquanto buscamos as informações...</p>
        </div>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
          <FaInfoCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">E-book não encontrado</h2>
          <p className="text-gray-600 mb-8">O e-book que você está procurando não está disponível ou foi removido.</p>
          <button
            onClick={() => router.push('/ebooks')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg inline-flex items-center transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Voltar para o catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/ebooks" className="hover:text-blue-600">E-books</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{ebook.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Cabeçalho do E-book */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Capa do E-book */}
              <div className="md:w-1/4 relative">
                <div className="relative aspect-[2/3] w-full max-w-[250px] mx-auto rounded-lg overflow-hidden shadow-2xl">
                  {ebook.coverImageUrl ? (
                    <Image
                      src={ebook.coverImageUrl}
                      alt={ebook.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      <FaBook className="text-gray-400 text-4xl" />
                    </div>
                  )}
                </div>
                {ebook.featured && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                    <FaStar className="mr-1" /> Destaque
                  </div>
                )}
              </div>

              {/* Informações do E-book */}
              <div className="md:w-3/4 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">{ebook.title}</h1>
                
                {ebook.author && (
                  <p className="text-xl mb-4 opacity-90">
                    por <span className="font-semibold">{ebook.author}</span>
                  </p>
                )}
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                  {ebook.format && (
                    <span className="bg-blue-500 bg-opacity-30 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center">
                      <FaFileAlt className="mr-1" /> {ebook.format}
                    </span>
                  )}
                  {ebook.pages && (
                    <span className="bg-blue-500 bg-opacity-30 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center">
                      <FaBook className="mr-1" /> {ebook.pages} páginas
                    </span>
                  )}
                  {ebook.language && (
                    <span className="bg-blue-500 bg-opacity-30 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center">
                      <FaLanguage className="mr-1" /> {ebook.language}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                  <div className="mb-4 sm:mb-0">
                    {ebook.price === 0 ? (
                      <div className="flex items-center">
                        <span className="text-3xl font-bold mr-3">Grátis</span>
                        <span className="bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded">Oferta especial</span>
                      </div>
                    ) : ebook.promotionalPrice ? (
                      <div className="flex items-center">
                        <div className="mr-3">
                          <span className="line-through text-gray-300 text-lg mr-2">
                            {formatPrice(ebook.price)}
                          </span>
                          <span className="text-3xl font-bold">
                            {formatPrice(ebook.promotionalPrice)}
                          </span>
                        </div>
                        <span className="bg-red-500 text-white text-xs font-medium px-2.5 py-1 rounded">Promoção</span>
                      </div>
                    ) : (
                      <span className="text-3xl font-bold">
                        {formatPrice(ebook.price)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    {ebook.price === 0 ? (
                      <button
                        onClick={handleGetFreeEbook}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg flex items-center transition-colors"
                      >
                        <FaDownload className="mr-2" /> Baixar Grátis
                      </button>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center transition-colors"
                      >
                        <FaShoppingCart className="mr-2" /> Adicionar ao Carrinho
                      </button>
                    )}
                    
                    <button
                      onClick={handleShare}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium py-3 px-4 rounded-lg flex items-center transition-colors"
                    >
                      <FaShare className="mr-2" /> Compartilhar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo do E-book */}
          <div className="p-8">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <div className="flex space-x-8">
                <button
                  className={`pb-4 font-medium text-sm flex items-center ${
                    activeTab === 'description'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('description')}
                >
                  <FaFileAlt className="mr-2" /> Descrição
                </button>
                <button
                  className={`pb-4 font-medium text-sm flex items-center ${
                    activeTab === 'details'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('details')}
                >
                  <FaInfoCircle className="mr-2" /> Detalhes
                </button>
              </div>
            </div>

            {/* Conteúdo da Tab */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                {activeTab === 'description' ? (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Sobre este E-book</h2>
                    <div className="prose max-w-none text-gray-600">
                      <p className="whitespace-pre-line">{ebook.description}</p>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">O que você vai aprender</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span>Conceitos fundamentais apresentados de forma clara e objetiva</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span>Exemplos práticos e aplicáveis ao mundo real</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span>Técnicas avançadas para aprimorar suas habilidades</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span>Recursos adicionais para continuar seu aprendizado</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Informações Técnicas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalhes do E-book</h3>
                        <ul className="space-y-4">
                          {ebook.format && (
                            <li className="flex items-start">
                              <FaFileAlt className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-gray-700 block">Formato</span>
                                <span className="text-gray-600">{ebook.format}</span>
                              </div>
                            </li>
                          )}
                          {ebook.pages && (
                            <li className="flex items-start">
                              <FaBook className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-gray-700 block">Páginas</span>
                                <span className="text-gray-600">{ebook.pages}</span>
                              </div>
                            </li>
                          )}
                          {ebook.language && (
                            <li className="flex items-start">
                              <FaLanguage className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-gray-700 block">Idioma</span>
                                <span className="text-gray-600">{ebook.language}</span>
                              </div>
                            </li>
                          )}
                          {ebook.isbn && (
                            <li className="flex items-start">
                              <FaBookmark className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-gray-700 block">ISBN</span>
                                <span className="text-gray-600">{ebook.isbn}</span>
                              </div>
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Publicação</h3>
                        <ul className="space-y-4">
                          {ebook.author && (
                            <li className="flex items-start">
                              <FaUser className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-gray-700 block">Autor</span>
                                <span className="text-gray-600">{ebook.author}</span>
                              </div>
                            </li>
                          )}
                          {ebook.publisher && (
                            <li className="flex items-start">
                              <FaBuilding className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-gray-700 block">Editora</span>
                                <span className="text-gray-600">{ebook.publisher}</span>
                              </div>
                            </li>
                          )}
                          {ebook.publicationDate && (
                            <li className="flex items-start">
                              <FaCalendarAlt className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-gray-700 block">Data de Publicação</span>
                                <span className="text-gray-600">{formatDate(ebook.publicationDate)}</span>
                              </div>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="md:col-span-1">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaInfoCircle className="text-blue-500 mr-2" /> Informações Importantes
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">Acesso imediato após a compra</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">Compatível com todos os dispositivos</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">Conteúdo atualizado regularmente</span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm">Suporte técnico disponível</span>
                    </li>
                  </ul>
                  
                  <div className="mt-6 pt-6 border-t border-blue-100">
                    <h4 className="font-medium text-gray-800 mb-3">Precisa de ajuda?</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Se você tiver dúvidas sobre este e-book ou problemas com o download, entre em contato com nossa equipe de suporte.
                    </p>
                    <Link 
                      href="/contato" 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                    >
                      Fale Conosco <FaArrowRight className="ml-1 text-xs" />
                    </Link>
                  </div>
                </div>
                
                {/* Outros e-books relacionados poderiam ser adicionados aqui */}
              </div>
            </div>
          </div>
        </div>
        
        {/* Botão para voltar */}
        <div className="mt-8 text-center">
          <Link 
            href="/ebooks" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <FaArrowLeft className="mr-2" /> Voltar para o catálogo de e-books
          </Link>
        </div>
      </div>
      
      {/* Modal de captura de leads */}
      {showLeadModal && ebook && (
        <LeadCaptureModal
          ebookTitle={ebook.title}
          onClose={() => setShowLeadModal(false)}
          onSubmit={handleLeadSubmit}
        />
      )}
    </div>
  );
} 