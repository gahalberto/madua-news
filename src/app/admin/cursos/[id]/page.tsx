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

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  price: number | null;
  promotionalPrice: number | null;
  isPublished: boolean;
  categoryId: string | null;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  learningPoints?: string[];
  duration: number;
  hasCertificate: boolean;
}

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // NOTA: Em versões futuras do Next.js, isso deve ser alterado para usar React.use(params)
  const courseId = params.id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState<Course>({
    id: "",
    title: "",
    description: "",
    imageUrl: null,
    price: null,
    promotionalPrice: null,
    categoryId: null,
    teacherId: "",
    isPublished: false,
    createdAt: "",
    updatedAt: "",
    learningPoints: [],
    duration: 0,
    hasCertificate: false,
  });

  // Buscar dados do curso e categorias
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        
        if (!response.ok) {
          throw new Error("Erro ao buscar dados do curso");
        }
        
        const courseData = await response.json();
        setFormData(courseData);
        
        if (courseData.imageUrl) {
          setImagePreview(courseData.imageUrl);
        }
      } catch (error) {
        console.error("Erro ao buscar curso:", error);
        toast.error("Erro ao carregar dados do curso");
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        toast.error("Erro ao carregar categorias");
      } finally {
        setIsFetching(false);
      }
    };

    fetchCourse();
    fetchCategories();
  }, [courseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: value === '' ? null : Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    setImageFile(file);

    // Criar uma URL para pré-visualização da imagem
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload da imagem");
      }

      const data = await response.json();
      setUploadProgress(100);
      return data.url;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast.error("Erro ao fazer upload da imagem");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Fazer upload da imagem, se houver
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadedImageUrl = await uploadImage();
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        }
      }

      // Preparar os dados do curso
      const courseData: Record<string, unknown> = {
        title: formData.title,
        description: formData.description,
        imageUrl,
        price: formData.price,
        promotionalPrice: formData.promotionalPrice,
        categoryId: formData.categoryId,
        isPublished: formData.isPublished,
        learningPoints: formData.learningPoints,
        duration: formData.duration,
        hasCertificate: formData.hasCertificate,
      };

      // Converter valores de preço se necessário
      if (typeof courseData.price === 'string') {
        courseData.price = parseFloat(courseData.price.replace(',', '.'));
      }
      
      if (typeof courseData.promotionalPrice === 'string') {
        courseData.promotionalPrice = parseFloat(courseData.promotionalPrice.replace(',', '.'));
      }

      // Enviar os dados para a API
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar curso");
      }

      toast.success("Curso atualizado com sucesso!");
      router.push("/admin/cursos");
    } catch (error: any) {
      console.error("Erro ao atualizar curso:", error);
      toast.error(error.message || "Erro ao atualizar curso");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do curso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Editar Curso</h1>
        <div className="flex space-x-2">
          <Link
            href={`/admin/cursos/${courseId}/aulas`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              ></path>
            </svg>
            Gerenciar Aulas
          </Link>
          <Link
            href="/admin/cursos"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Voltar
          </Link>
        </div>
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
                id="duration"
                name="duration"
                min="0"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                O que você aprenderá
              </label>
              <div className="space-y-2">
                {formData.learningPoints?.map((point, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={point}
                      onChange={(e) => {
                        const newPoints = [...(formData.learningPoints || [])];
                        newPoints[index] = e.target.value;
                        setFormData({ ...formData, learningPoints: newPoints });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newPoints = [...(formData.learningPoints || [])];
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
                      learningPoints: [...(formData.learningPoints || []), ""]
                    });
                  }}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Adicionar ponto
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasCertificate"
                  name="hasCertificate"
                  checked={formData.hasCertificate}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="hasCertificate" className="ml-2 block text-sm text-gray-700">
                  Oferece certificado
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Se não for publicado, o curso ficará como rascunho e não estará visível para os alunos.
              </p>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Preço (R$) *
              </label>
              <input
                type="text"
                id="price"
                name="price"
                required
                value={typeof formData.price === 'number' ? formData.price.toString() : formData.price || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 199,90"
              />
            </div>

            <div>
              <label htmlFor="promotionalPrice" className="block text-sm font-medium text-gray-700">
                Preço Promocional (R$)
              </label>
              <input
                type="text"
                id="promotionalPrice"
                name="promotionalPrice"
                value={typeof formData.promotionalPrice === 'number' ? formData.promotionalPrice.toString() : formData.promotionalPrice || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 149,90"
              />
              <p className="mt-1 text-sm text-gray-500">
                Deixe em branco se não houver preço promocional
              </p>
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                Categoria *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                value={formData.categoryId || ''}
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
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Pré-visualização"
                      width={128}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm text-center px-2">
                      Nenhuma imagem selecionada
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
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
                  {isUploading && (
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
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
                  Publicar curso
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Se não for publicado, o curso ficará como rascunho e não estará visível para os alunos.
              </p>
            </div>
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
              disabled={isLoading || isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 