"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, Trash2, Upload, X, Eye } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  const id = params.id; // Usar params diretamente
  
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    imageFile: null as File | null,
    imageUrl: null as string | null,
    published: false,
    categoryId: "",
  });

  // Buscar dados do post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        
        if (!response.ok) {
          throw new Error("Erro ao buscar post");
        }
        
        const post = await response.json();
        
        setFormData({
          title: post.title,
          slug: generateSlug(post.title),
          excerpt: post.excerpt || "",
          content: post.content,
          metaTitle: post.metaTitle || post.title,
          metaDescription: post.metaDescription || "",
          imageFile: null,
          imageUrl: post.imageUrl,
          published: post.published,
          categoryId: post.categoryId || "",
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

  // Gerar meta title a partir do título se não for preenchido
  useEffect(() => {
    if (formData.title && !formData.metaTitle) {
      setFormData(prev => ({ ...prev, metaTitle: formData.title }));
    }
  }, [formData.title, formData.metaTitle]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        setFormData((prev) => ({ ...prev, imageFile: file }));
        
        // Criar preview da imagem
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, categoryId: e.target.value }));
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageFile: null, imageUrl: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Inserir formatação no editor
  const insertFormatting = (format: string) => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    let formattedText = "";
    
    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "heading":
        formattedText = `## ${selectedText}`;
        break;
      case "link":
        formattedText = `[${selectedText}](url)`;
        break;
      case "image":
        formattedText = `![alt text](url)`;
        break;
      case "code":
        formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
        break;
      case "list":
        formattedText = `- ${selectedText.split('\n').join('\n- ')}`;
        break;
      default:
        formattedText = selectedText;
    }
    
    const newContent = editor.value.substring(0, start) + formattedText + editor.value.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Reposicionar o cursor após a formatação
    setTimeout(() => {
      editor.focus();
      editor.selectionStart = start + formattedText.length;
      editor.selectionEnd = start + formattedText.length;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validar campos obrigatórios
      if (!formData.title || !formData.content) {
        toast.error("Título e conteúdo são obrigatórios");
        setIsSaving(false);
        return;
      }

      // Preparar os dados para envio
      const postData: {
        title: string;
        content: string;
        published: boolean;
        imageUrl?: string;
        categoryId?: string;
        excerpt?: string;
        metaTitle?: string;
        metaDescription?: string;
      } = {
        title: formData.title,
        content: formData.content,
        published: formData.published,
        excerpt: formData.excerpt,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
      };

      if (formData.categoryId) {
        postData.categoryId = formData.categoryId;
      }

      // Se houver uma imagem nova, fazer upload
      if (formData.imageFile) {
        try {
          const imageFormData = new FormData();
          imageFormData.append("file", formData.imageFile);

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: imageFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error("Erro ao fazer upload da imagem");
          }

          const { imageUrl } = await uploadResponse.json();
          postData.imageUrl = imageUrl;
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error);
          toast.error("Erro ao fazer upload da imagem");
          setIsSaving(false);
          return;
        }
      } else if (formData.imageUrl) {
        // Manter a imagem existente
        postData.imageUrl = formData.imageUrl;
      }

      console.log("Dados enviados:", postData); // Log para debug

      // Enviar dados para a API
      const response = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar post");
      }

      const updatedPost = await response.json();
      console.log("Post atualizado:", updatedPost);

      toast.success("Post atualizado com sucesso!");
      router.push("/admin/blog");
    } catch (error) {
      console.error("Erro ao atualizar post:", error);
      toast.error(error instanceof Error ? error.message : "Ocorreu um erro ao atualizar o post");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao excluir post");
      }

      toast.success("Post excluído com sucesso!");
      router.push("/admin/blog");
    } catch (error) {
      console.error("Erro ao excluir post:", error);
      toast.error(error instanceof Error ? error.message : "Ocorreu um erro ao excluir o post");
    } finally {
      setIsDeleting(false);
    }
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
        <div className="flex items-center space-x-2">
          <Link
            href="/admin/blog"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Editar Post</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/blog/${id}`}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            target="_blank"
          >
            <Eye size={16} className="mr-2" />
            Visualizar
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
            disabled={isDeleting}
          >
            <Trash2 size={16} className="mr-2" />
            {isDeleting ? "Excluindo..." : "Excluir"}
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

            {/* Categoria e Status */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma categoria</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="published" className="text-sm text-gray-700">
                  Publicar post (visível para todos)
                </label>
              </div>
            </div>

            {/* Resumo */}
            <div className="col-span-2">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                Resumo *
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={3}
                required
                value={formData.excerpt}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Breve resumo do post (será exibido nas listagens)"
              ></textarea>
            </div>

            {/* Imagem */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagem de Destaque
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {imagePreview ? (
                  <div className="relative w-full h-64">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <span>Clique para fazer upload</span>
                          <input
                            id="image"
                            name="image"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleChange}
                            className="sr-only"
                            accept="image/*"
                          />
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF até 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Editor de Conteúdo */}
            <div className="col-span-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Conteúdo *
              </label>
              <div className="mb-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => insertFormatting("bold")}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("italic")}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("heading")}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("link")}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("image")}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Imagem
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("code")}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Código
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("list")}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Lista
                </button>
              </div>
              <textarea
                id="content"
                name="content"
                rows={15}
                required
                ref={editorRef}
                value={formData.content}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="Conteúdo do post (suporta Markdown)"
              ></textarea>
              <p className="mt-1 text-sm text-gray-500">
                Use Markdown para formatação. Você pode usar os botões acima para ajudar.
              </p>
            </div>

            {/* SEO */}
            <div className="col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-3">SEO</h3>
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
                </div>
                <div>
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Descrição
                  </label>
                  <input
                    type="text"
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição para SEO (150-160 caracteres)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Link
              href="/admin/blog"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isSaving}
            >
              <Save size={16} className="mr-2" />
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 