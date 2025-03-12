"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { FaUpload, FaArrowLeft } from "react-icons/fa";

export default function AddEbookPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    promotionalPrice: "",
    author: "",
    publisher: "",
    isbn: "",
    language: "Português",
    pages: "",
    format: "PDF",
    publicationDate: "",
    featured: false,
    isPublished: false
  });

  // Função para lidar com a mudança nos campos do formulário
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Função para lidar com o upload da capa
  const handleCoverUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar se o arquivo é uma imagem
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem válido");
      return;
    }

    // Criar URL para preview
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
  };

  // Função para lidar com o upload do arquivo do e-book
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar se o arquivo é um PDF, EPUB, etc.
    const validTypes = ["application/pdf", "application/epub+zip"];
    if (!validTypes.includes(file.type)) {
      toast.error("Por favor, selecione um arquivo PDF ou EPUB válido");
      return;
    }

    setSelectedFile(file);
    toast.success(`Arquivo "${file.name}" selecionado`);
  };

  // Função para fazer upload de arquivo
  const uploadFile = async (file: File, type: 'cover' | 'file') => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`/api/upload?type=${type}`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao fazer upload do ${type === 'cover' ? 'capa' : 'arquivo'}`);
    }
    
    const data = await response.json();
    return data.fileUrl;
  };

  // Função para enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!formData.title || !formData.description || formData.price === undefined || formData.price === null || !selectedFile) {
      toast.error("Por favor, preencha todos os campos obrigatórios e faça upload do arquivo do e-book");
      return;
    }

    try {
      setLoading(true);
      
      // Fazer upload dos arquivos
      let coverImageUrl = null;
      if (coverPreview && coverInputRef.current?.files?.[0]) {
        coverImageUrl = await uploadFile(coverInputRef.current.files[0], 'cover');
      }
      
      const fileUrl = await uploadFile(selectedFile, 'file');
      
      // Preparar os dados para enviar à API
      const ebookData = {
        ...formData,
        price: parseFloat(formData.price),
        promotionalPrice: formData.promotionalPrice ? parseFloat(formData.promotionalPrice) : null,
        coverImageUrl,
        fileUrl,
        pages: formData.pages ? parseInt(formData.pages) : null,
      };
      
      // Enviar os dados para a API
      const response = await fetch('/api/ebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ebookData),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao adicionar e-book');
      }
      
      toast.success("E-book adicionado com sucesso!");
      router.push("/admin/ebooks");
    } catch (error) {
      console.error("Erro ao adicionar e-book:", error);
      toast.error("Erro ao adicionar e-book");
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Voltar para a lista de e-books
        </button>
        <h1 className="text-2xl font-bold mt-4">Adicionar Novo E-book</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna da esquerda - Informações básicas */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Digite o título do e-book"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">
                Descrição <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Digite uma descrição detalhada do e-book"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900">
                  Preço (R$) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label htmlFor="promotionalPrice" className="block mb-2 text-sm font-medium text-gray-900">
                  Preço Promocional (R$)
                </label>
                <input
                  type="number"
                  id="promotionalPrice"
                  name="promotionalPrice"
                  value={formData.promotionalPrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="author" className="block mb-2 text-sm font-medium text-gray-900">
                  Autor
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="Nome do autor"
                />
              </div>
              <div>
                <label htmlFor="publisher" className="block mb-2 text-sm font-medium text-gray-900">
                  Editora
                </label>
                <input
                  type="text"
                  id="publisher"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="Nome da editora"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="isbn" className="block mb-2 text-sm font-medium text-gray-900">
                  ISBN
                </label>
                <input
                  type="text"
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="978-3-16-148410-0"
                />
              </div>
              <div>
                <label htmlFor="language" className="block mb-2 text-sm font-medium text-gray-900">
                  Idioma
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                >
                  <option value="Português">Português</option>
                  <option value="Inglês">Inglês</option>
                  <option value="Espanhol">Espanhol</option>
                  <option value="Francês">Francês</option>
                  <option value="Alemão">Alemão</option>
                  <option value="Italiano">Italiano</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label htmlFor="pages" className="block mb-2 text-sm font-medium text-gray-900">
                  Páginas
                </label>
                <input
                  type="number"
                  id="pages"
                  name="pages"
                  value={formData.pages}
                  onChange={handleChange}
                  min="1"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="Número de páginas"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="format" className="block mb-2 text-sm font-medium text-gray-900">
                  Formato
                </label>
                <select
                  id="format"
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                >
                  <option value="PDF">PDF</option>
                  <option value="EPUB">EPUB</option>
                  <option value="MOBI">MOBI</option>
                  <option value="PDF/EPUB">PDF/EPUB</option>
                  <option value="PDF/MOBI">PDF/MOBI</option>
                  <option value="PDF/EPUB/MOBI">PDF/EPUB/MOBI</option>
                </select>
              </div>
              <div>
                <label htmlFor="publicationDate" className="block mb-2 text-sm font-medium text-gray-900">
                  Data de Publicação
                </label>
                <input
                  type="date"
                  id="publicationDate"
                  name="publicationDate"
                  value={formData.publicationDate}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-900">
                  Destaque
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPublished" className="ml-2 text-sm font-medium text-gray-900">
                  Publicar imediatamente
                </label>
              </div>
            </div>
          </div>

          {/* Coluna da direita - Upload de arquivos e imagem */}
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Capa do E-book
              </label>
              <div 
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                onClick={() => coverInputRef.current?.click()}
              >
                {coverPreview ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={coverPreview}
                      alt="Capa do E-book"
                      fill
                      className="object-contain p-2"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverPreview(null);
                        if (coverInputRef.current) coverInputRef.current.value = "";
                      }}
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG ou WEBP (Recomendado: 600x800px)</p>
                  </div>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Arquivo do E-book <span className="text-red-500">*</span>
              </label>
              <div 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaUpload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="text-sm text-gray-500">
                    {selectedFile ? (
                      <span className="font-semibold text-blue-600">{selectedFile.name}</span>
                    ) : (
                      <span className="font-semibold">Clique para fazer upload do arquivo</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">PDF ou EPUB (Máx. 100MB)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.epub"
                  className="hidden"
                  onChange={handleFileUpload}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar E-book"}
          </button>
        </div>
      </form>
    </div>
  );
} 