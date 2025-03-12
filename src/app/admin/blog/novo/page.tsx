"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Tag {
  id: string;
  name: string;
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    imageFile: null as File | null,
    published: false,
    categoryId: "",
  });

  // Simulação de dados para demonstração
  useEffect(() => {
    // Em um ambiente real, esses dados viriam de uma API
    setAvailableTags([
      { id: "1", name: "Programação" },
      { id: "2", name: "Design" },
      { id: "3", name: "Marketing" },
      { id: "4", name: "Educação" },
      { id: "5", name: "Tecnologia" },
      { id: "6", name: "Desenvolvimento Web" },
      { id: "7", name: "Mobile" },
      { id: "8", name: "IA" },
    ]);

    // Buscar categorias
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
    
    fetchCategories();
  }, []);

  // Gerar slug a partir do título
  useEffect(() => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
      
      setFormData(prev => ({ ...prev, slug }));
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

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageFile: null }));
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
    setIsLoading(true);

    try {
      // Validar campos obrigatórios
      if (!formData.title || !formData.content || !formData.excerpt) {
        toast.error("Preencha todos os campos obrigatórios");
        setIsLoading(false);
        return;
      }

      // Preparar os dados para envio
      const postData: {
        title: string;
        content: string;
        published: boolean;
        imageUrl?: string;
        excerpt: string;
        slug: string;
        metaTitle?: string;
        metaDescription?: string;
        categoryId?: string;
      } = {
        title: formData.title,
        content: formData.content,
        published: formData.published,
        excerpt: formData.excerpt,
        slug: formData.slug,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
      };

      if (formData.categoryId) {
        postData.categoryId = formData.categoryId;
      }

      // Se houver uma imagem, fazer upload
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
          setIsLoading(false);
          return;
        }
      }

      // Enviar dados para a API
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar post");
      }

      const createdPost = await response.json();
      console.log("Post criado:", createdPost);

      toast.success("Post criado com sucesso!");
      router.push("/admin/blog");
    } catch (error) {
      console.error("Erro ao criar post:", error);
      toast.error(error instanceof Error ? error.message : "Ocorreu um erro ao criar o post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, categoryId: e.target.value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Criar Novo Post</h1>
        <Link
          href="/admin/blog"
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </Link>
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
                Resumo *
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                required
                value={formData.excerpt}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Breve resumo do post (será exibido nas listagens e compartilhamentos)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Máximo de 160 caracteres para SEO ideal
                <span className="ml-1 font-medium text-gray-700">
                  ({formData.excerpt.length}/160)
                </span>
              </p>
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
                  className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-700"
                  title="Negrito"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("italic")}
                  className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-700"
                  title="Itálico"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("heading")}
                  className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-700"
                  title="Título"
                >
                  H
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("link")}
                  className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-700"
                  title="Link"
                >
                  🔗
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("image")}
                  className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-700"
                  title="Imagem"
                >
                  🖼️
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("code")}
                  className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-700"
                  title="Código"
                >
                  {"</>"}
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("list")}
                  className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-700"
                  title="Lista"
                >
                  • Lista
                </button>
              </div>
              <textarea
                id="content"
                name="content"
                ref={editorRef}
                required
                value={formData.content}
                onChange={handleChange}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="Conteúdo do post em formato Markdown"
              />
              <p className="mt-1 text-sm text-gray-500">
                Suporta formatação Markdown
              </p>
            </div>

            {/* Imagem de Destaque */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagem de Destaque
              </label>
              <div 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 ${
                  imagePreview ? 'border-solid' : 'border-dashed'
                } rounded-md cursor-pointer hover:bg-gray-50`}
                onClick={handleImageClick}
              >
                {imagePreview ? (
                  <div className="relative w-full">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="mx-auto max-h-64 object-contain"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Enviar uma imagem</span>
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF até 5MB</p>
                  </div>
                )}
                <input
                  id="image-upload"
                  name="imageFile"
                  type="file"
                  ref={fileInputRef}
                  className="sr-only"
                  accept="image/*"
                  onChange={handleChange}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Recomendado: 1200 x 630 pixels para compartilhamento em redes sociais
              </p>
            </div>

            {/* Tags */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTags.includes(tag.id)
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Selecione tags relevantes para melhorar a descoberta do seu post
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

            {/* SEO */}
            <div className="col-span-2 border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">SEO</h3>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    Recomendado: até 60 caracteres
                    <span className="ml-1 font-medium text-gray-700">
                      ({formData.metaTitle.length}/60)
                    </span>
                  </p>
                </div>
                
                <div>
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Descrição
                  </label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription || formData.excerpt}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrição para SEO (se diferente do resumo)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Recomendado: até 160 caracteres
                    <span className="ml-1 font-medium text-gray-700">
                      ({(formData.metaDescription || formData.excerpt).length}/160)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-4">
            <Link
              href="/admin/blog"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Salvando..." : "Publicar Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 