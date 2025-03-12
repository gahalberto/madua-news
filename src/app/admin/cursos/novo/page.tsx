"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface Category {
  id: string;
  name: string;
}

interface FormData {
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  promotionalPrice?: number;
  categoryId: string;
  isPublished: boolean;
  learningPoints: string[];
  duration: number;
  hasCertificate: boolean;
}

export default function NewCoursePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showSeoFields, setShowSeoFields] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    imageUrl: "",
    price: 0,
    promotionalPrice: 0,
    categoryId: "",
    isPublished: false,
    learningPoints: [],
    duration: 0,
    hasCertificate: false,
  });

  // Buscar categorias da API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        toast.error("Erro ao carregar categorias");
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: value === '' ? '' : Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
          price: formData.price,
          promotionalPrice: formData.promotionalPrice,
          categoryId: formData.categoryId,
          isPublished: formData.isPublished,
          learningPoints: formData.learningPoints,
          duration: formData.duration,
          hasCertificate: formData.hasCertificate,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar o curso');
      }

      const data = await response.json();
      router.push(`/admin/cursos/${data.id}`);
      toast.success('Curso criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar curso:', error);
      toast.error('Erro ao criar o curso. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Adicionar Novo Curso</h1>
        <Link
          href="/admin/cursos"
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título do Curso *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Desenvolvimento Web com React"
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva o conteúdo e objetivos do curso"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duração (em minutos)
              </label>
              <input
                type="number"
                name="duration"
                id="duration"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                O que você aprenderá
              </label>
              <div className="space-y-2">
                {formData.learningPoints.map((point, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={point}
                      onChange={(e) => {
                        const newPoints = [...formData.learningPoints];
                        newPoints[index] = e.target.value;
                        setFormData({ ...formData, learningPoints: newPoints });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newPoints = [...formData.learningPoints];
                        newPoints.splice(index, 1);
                        setFormData({ ...formData, learningPoints: newPoints });
                      }}
                      className="mt-1 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Remover
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      learningPoints: [...formData.learningPoints, ""]
                    });
                  }}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Adicionar ponto
                </button>
              </div>
            </div>

            <div className="col-span-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Preço
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">R$</span>
                </div>
                <input
                  type="number"
                  name="price"
                  id="price"
                  required
                  className="mt-1 block w-full pl-12 pr-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-span-2">
              <label htmlFor="promotionalPrice" className="block text-sm font-medium text-gray-700">
                Preço promocional
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">R$</span>
                </div>
                <input
                  type="number"
                  name="promotionalPrice"
                  id="promotionalPrice"
                  className="mt-1 block w-full pl-12 pr-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.promotionalPrice}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagem do Curso
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <div className="flex-shrink-0 h-32 w-32 border-2 border-dashed border-gray-300 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                  {formData.imageUrl && (
                    <Image
                      src={formData.imageUrl}
                      alt="Pré-visualização"
                      width={128}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Verificar o tipo do arquivo
                        if (!file.type.includes("image")) {
                          toast.error("Por favor, selecione uma imagem válida");
                          return;
                        }

                        // Verificar o tamanho do arquivo (máximo 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("A imagem deve ter no máximo 5MB");
                          return;
                        }

                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({ ...formData, imageUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="sr-only"
                  />
                  <label
                    htmlFor="image"
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer inline-block"
                  >
                    Selecionar Imagem
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    PNG, JPG ou GIF até 5MB
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                  Publicar curso imediatamente
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Se não for publicado, o curso ficará como rascunho e não estará visível para os alunos.
              </p>
            </div>

            <div className="col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasCertificate"
                  name="hasCertificate"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={formData.hasCertificate}
                  onChange={handleChange}
                />
                <label htmlFor="hasCertificate" className="ml-2 block text-sm text-gray-900">
                  Oferece certificado
                </label>
              </div>
            </div>

            <div className="col-span-2">
              <button
                type="button"
                onClick={() => setShowSeoFields(!showSeoFields)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 mr-1 transition-transform ${showSeoFields ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Configurações de SEO
              </button>
            </div>

            {showSeoFields && (
              <>
                <div className="col-span-2">
                  <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Título para SEO
                  </label>
                  <input
                    type="text"
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Título otimizado para mecanismos de busca"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Deixe em branco para usar o título do curso. Recomendado: até 60 caracteres.
                  </p>
                </div>

                <div className="col-span-2">
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição para SEO
                  </label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição otimizada para mecanismos de busca"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Deixe em branco para usar o início da descrição do curso. Recomendado: 150-160 caracteres.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-4">
            <Link
              href="/admin/cursos"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Salvando..." : "Salvar Curso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 