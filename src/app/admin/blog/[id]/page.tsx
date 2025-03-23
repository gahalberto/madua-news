"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import ImageUploader from "@/components/admin/ImageUploader";
import { BannerPreview } from "@/components/BannerPreview";
import { logDebug } from "@/logs/editor-debug";

// Importação dinâmica do editor para evitar problemas de SSR
const Editor = dynamic(() => import("@/components/admin/Editor"), { ssr: false });

// Tipos para evitar erros de TypeScript
interface Category {
  id: string;
  name: string;
}

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  imageFile: File | null;
  imageUrl: string | null;
  published: boolean;
  categoryId: string | null;
}

interface TelegramPayload {
  title: string;
  excerpt: string;
  slug: string;
}

export default function EditBlogPostPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingToTelegram, setIsSendingToTelegram] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    imageFile: null,
    imageUrl: null,
    published: false,
    categoryId: null,
  });

  // Manipulador para mudanças nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0] || null;
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      return;
    }

    if (type === 'checkbox') {
      const checkboxInput = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkboxInput.checked
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manipulador para mudanças no conteúdo do editor
  const handleEditorChange = (content: string) => {
    logDebug("Editor content changed", { length: content?.length, preview: content?.substring(0, 100) });
    
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  // Buscar dados do post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        
        if (!response.ok) {
          throw new Error("Erro ao buscar post");
        }
        
        const post = await response.json();
        logDebug("Post data fetched", { 
          title: post.title, 
          contentLength: post.content?.length,
          contentPreview: post.content?.substring(0, 100)
        });
        
        setFormData({
          title: post.title,
          slug: post.slug || generateSlug(post.title),
          excerpt: post.excerpt || "",
          content: post.content || "",
          metaTitle: post.metaTitle || post.title,
          metaDescription: post.metaDescription || "",
          imageFile: null,
          imageUrl: post.imageUrl || null,
          published: post.published || false,
          categoryId: post.categoryId || null,
        });
        
        if (post.imageUrl) {
          setImagePreview(post.imageUrl);
        }
        
      } catch (error) {
        console.error("Erro ao buscar post:", error);
        toast.error("Erro ao carregar o post");
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        
        if (!response.ok) {
          throw new Error("Erro ao buscar categorias");
        }
        
        const categories = await response.json();
        setAvailableCategories(categories);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };
    
    fetchPost();
    fetchCategories();
  }, [id]);

  // Gerar slug a partir do título
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
  };

  // Atualizar slug quando o título mudar
  useEffect(() => {
    if (formData.title) {
      setFormData(prev => ({ ...prev, slug: generateSlug(formData.title) }));
    }
  }, [formData.title]);

  // Manipulador para envio do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error("Por favor preencha os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      const { title, slug, excerpt, content, metaTitle, metaDescription, imageFile, imageUrl, published, categoryId } = formData;
      
      const postData: FormData = {
        title,
        slug,
        excerpt,
        content,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt.substring(0, 160),
        imageFile,
        imageUrl,
        published,
        categoryId: categoryId || null,
      };

      // Se houver nova imagem, enviar para upload primeiro
      if (postData.imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", postData.imageFile);
        uploadFormData.append("type", "blog");
        
        try {
          logDebug("Enviando imagem", { fileName: postData.imageFile.name, fileSize: postData.imageFile.size });
          
          const uploadResponse = await fetch("/api/upload?type=blog", {
            method: "POST",
            body: uploadFormData,
          });
          
          if (!uploadResponse.ok) {
            throw new Error(`Erro no upload: ${uploadResponse.status}`);
          }
          
          const { url } = await uploadResponse.json();
          postData.imageUrl = url;
        } catch (uploadError) {
          console.error("Erro durante upload:", uploadError);
          toast.error(`Erro no upload: ${uploadError instanceof Error ? uploadError.message : "Erro desconhecido"}`);
        }
      }

      logDebug("Enviando post para API", { postDataLength: JSON.stringify(postData).length });
      
      const response = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(`Erro ao salvar: ${response.status}`);
      }

      toast.success("Post atualizado com sucesso!");
      router.push("/admin/blog");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para excluir o post
  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir post");
      }
      
      toast.success("Post excluído com sucesso!");
      router.push("/admin/blog");
    } catch (error) {
      console.error("Erro ao excluir post:", error);
      toast.error(`Erro ao excluir post: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manipulador para upload de imagem
  const handleImageChange = (file: File | null) => {
    if (!file) {
      setFormData((prev) => ({ ...prev, imageFile: null }));
      setImagePreview("");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        console.log('Nova imagem carregada:', {
          fileName: file.name,
          fileSize: file.size,
          previewLength: result.length
        });
        setImagePreview(result);
      }
    };
    reader.readAsDataURL(file);
    
    setFormData((prev) => ({ ...prev, imageFile: file }));
  };

  // Função para enviar para o Telegram
  const handleSendToTelegram = async () => {
    try {
      setIsSendingToTelegram(true);

      const response = await fetch('/api/admin/telegram/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title || '',
          excerpt: formData.excerpt || '',
          slug: formData.slug || '',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao enviar para o Telegram');
      }

      toast.success('Post enviado para o Telegram com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar para o Telegram:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar para o Telegram');
    } finally {
      setIsSendingToTelegram(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-6 w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
            <div className="h-40 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-2 w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded mb-2 w-1/4"></div>
            <div className="h-6 bg-gray-200 rounded mb-2 w-1/5"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Post</h1>
        <div className="flex items-center space-x-2">
          <Link
            href={`/blog/${id}`}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            target="_blank"
          >
            <span className="mr-2">Ver no Blog</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </Link>
          <button
            onClick={handleSendToTelegram}
            disabled={isSendingToTelegram || isSubmitting}
            className="flex items-center px-4 py-2 bg-[#0088cc] text-white rounded-md hover:bg-[#0077b3] transition-colors disabled:opacity-50"
          >
            <span className="mr-2">Enviar ao Telegram</span>
            {isSendingToTelegram ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.52.36-.99.53-1.41.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.4-.89.03-.24.37-.49 1.02-.75 4.04-1.76 6.74-2.92 8.09-3.48 3.85-1.6 4.64-1.88 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.14-.02.3-.03.42z"/>
              </svg>
            )}
          </button>
          <button
            onClick={handleDelete}
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            disabled={isSubmitting}
          >
            Excluir
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Título e Slug */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Título do post"
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="url-amigavel-do-post"
              />
              <p className="mt-1 text-sm text-gray-500">
                URL amigável para SEO (gerada automaticamente)
              </p>
            </div>

            {/* Resumo */}
            <div className="col-span-2">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                Resumo
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Breve resumo do post (usado em listagens e SEO)"
              ></textarea>
            </div>

            {/* Editor de Conteúdo */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo *
              </label>
              <Editor
                initialContent={formData.content}
                onChange={handleEditorChange}
                placeholder="Conteúdo do post"
              />
              <div className="mt-2 text-sm text-blue-600 cursor-pointer" onClick={() => logDebug("Conteúdo atual", { content: formData.content })}>
                Verificar conteúdo no console
              </div>
            </div>

            {/* Categoria */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sem categoria</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status de Publicação */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status de Publicação
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="published" className="ml-2 text-sm text-gray-700">
                  Publicar post (visível para todos)
                </label>
              </div>
            </div>

            {/* Upload de Imagem */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem de Destaque
              </label>
              <ImageUploader
                initialImageUrl={imagePreview}
                onImageChange={handleImageChange}
                className="mb-2"
              />
              <p className="text-sm text-gray-500">
                Imagem principal do post. Recomendamos dimensões de 1200x630px.
              </p>
            </div>

            {/* Preview do Banner */}
            {formData.title && (imagePreview || formData.imageUrl) && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview do Banner para Redes Sociais
                </label>
                <div className="mb-2 text-sm text-gray-500">
                  {imagePreview ? 'Usando imagem do preview' : 'Usando imagem existente'}
                </div>
                <BannerPreview
                  title={formData.title}
                  imageUrl={imagePreview || formData.imageUrl || ''}
                />
              </div>
            )}

            {/* SEO */}
            <div className="col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-2">SEO</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Título
                  </label>
                  <input
                    type="text"
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Título para SEO (se diferente do título principal)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.metaTitle.length} / 60 caracteres
                  </p>
                </div>
                <div>
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Descrição
                  </label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição para SEO (se diferente do resumo)"
                  ></textarea>
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.metaDescription.length} / 160 caracteres
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Link
              href="/admin/blog"
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 