"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { 
  FileText, 
  Upload, 
  Trash2, 
  Save
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Importar o editor de texto rico TipTap dinamicamente (sem SSR)
const TipTapEditor = dynamic(() => import("@/components/TipTapEditor"), { ssr: false });

interface Course {
  id: string;
  title: string;
}

interface FormData {
  title: string;
  description: string;
  contentType: "VIDEO" | "TEXT" | "QUIZ";
  duration: number;
  youtubeVideoId: string;
  content: string;
  isPublished: boolean;
  isPreview: boolean;
  position: number;
}

export default function NewChapterPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // Em versões futuras do Next.js, será necessário usar React.use(params)
  const courseId = params.id;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCourse, setIsFetchingCourse] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; size: number; type: string; description: string }[]>([]);
  const [currentTab, setCurrentTab] = useState<"basic" | "content" | "files">("basic");
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    contentType: "VIDEO",
    duration: 0,
    youtubeVideoId: "",
    content: "",
    isPublished: false,
    isPreview: false,
    position: 1,
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
          throw new Error("Erro ao carregar o curso");
        }
        const data = await response.json();
        setCourse(data);
        
        // Buscar a posição para a nova aula (número de aulas + 1)
        const chaptersResponse = await fetch(`/api/courses/${courseId}/chapters`);
        if (chaptersResponse.ok) {
          const chapters = await chaptersResponse.json();
          setFormData(prev => ({
            ...prev,
            position: chapters.length + 1
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar curso:", error);
        toast.error("Erro ao carregar o curso");
      } finally {
        setIsFetchingCourse(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: value === '' ? 0 : Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleContentChange = (value: string) => {
    setFormData({ ...formData, content: value });
  };

  const extractYoutubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const videoId = extractYoutubeId(url);
    
    if (videoId) {
      setFormData({ 
        ...formData, 
        youtubeVideoId: videoId 
      });
    } else {
      // Se não for uma URL válida, apenas armazene o valor como está
      setFormData({ 
        ...formData, 
        youtubeVideoId: url 
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Verificar o tamanho do arquivo (máximo 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 50MB");
      return;
    }

    // Aqui você implementaria o upload real para seu servidor ou serviço de armazenamento
    // Por enquanto, vamos simular um upload bem-sucedido
    
    // Simulação de upload
    setIsLoading(true);
    
    try {
      // Simular um atraso de upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Adicionar o arquivo à lista de arquivos
      const newFile = {
        name: file.name,
        url: URL.createObjectURL(file), // Na implementação real, seria a URL do arquivo no servidor
        size: file.size,
        type: file.type,
        description: ""
      };
      
      setUploadedFiles([...uploadedFiles, newFile]);
      toast.success("Arquivo adicionado com sucesso");
    } catch (error) {
      console.error("Erro ao fazer upload do arquivo:", error);
      toast.error("Erro ao fazer upload do arquivo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDescriptionChange = (index: number, description: string) => {
    const newFiles = [...uploadedFiles];
    newFiles[index].description = description;
    setUploadedFiles(newFiles);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar campos obrigatórios
      if (!formData.title) {
        toast.error("O título da aula é obrigatório");
        setIsLoading(false);
        return;
      }

      // Validar campos específicos por tipo de conteúdo
      if (formData.contentType === "VIDEO" && !formData.youtubeVideoId) {
        toast.error("O ID do vídeo do YouTube é obrigatório para aulas do tipo vídeo");
        setIsLoading(false);
        return;
      }

      if (formData.contentType === "TEXT" && !formData.content) {
        toast.error("O conteúdo da aula é obrigatório para aulas do tipo texto");
        setIsLoading(false);
        return;
      }

      // Preparar os dados para envio
      const chapterData = {
        ...formData,
        courseId,
        // Na implementação real, você enviaria os arquivos para um serviço de armazenamento
        // e salvaria as URLs no banco de dados
        downloadFiles: uploadedFiles.map(file => ({
          name: file.name,
          url: file.url,
          size: file.size,
          type: file.type,
          description: file.description
        }))
      };

      // Enviar os dados para a API
      const response = await fetch(`/api/courses/${courseId}/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chapterData),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar a aula");
      }

      toast.success("Aula criada com sucesso");
      router.push(`/admin/cursos/${courseId}/aulas`);
    } catch (error) {
      console.error("Erro ao criar aula:", error);
      toast.error("Erro ao criar a aula");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingCourse) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Nova Aula</h1>
          <p className="text-gray-600">Curso: {course?.title}</p>
        </div>
        <Link
          href={`/admin/cursos/${courseId}/aulas`}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Voltar para aulas
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setCurrentTab("basic")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                currentTab === "basic"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Informações Básicas
            </button>
            <button
              onClick={() => setCurrentTab("content")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                currentTab === "content"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Conteúdo
            </button>
            <button
              onClick={() => setCurrentTab("files")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                currentTab === "files"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Arquivos
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {currentTab === "basic" && (
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Título da Aula *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="contentType" className="block text-sm font-medium text-gray-700">
                  Tipo de Conteúdo *
                </label>
                <select
                  id="contentType"
                  name="contentType"
                  required
                  value={formData.contentType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="VIDEO">Vídeo</option>
                  <option value="TEXT">Texto</option>
                  <option value="QUIZ">Quiz</option>
                </select>
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                  Posição
                </label>
                <input
                  type="number"
                  id="position"
                  name="position"
                  min="1"
                  value={formData.position}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                    Publicar aula
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPreview"
                    name="isPreview"
                    checked={formData.isPreview}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPreview" className="ml-2 block text-sm text-gray-900">
                    Disponibilizar como prévia
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentTab === "content" && (
            <div className="space-y-6">
              {formData.contentType === "VIDEO" && (
                <div>
                  <label htmlFor="youtubeVideoId" className="block text-sm font-medium text-gray-700">
                    URL ou ID do Vídeo do YouTube *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="youtubeVideoId"
                      name="youtubeVideoId"
                      value={formData.youtubeVideoId}
                      onChange={handleYoutubeUrlChange}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Cole a URL completa do vídeo ou apenas o ID (ex: dQw4w9WgXcQ)
                  </p>

                  {formData.youtubeVideoId && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Pré-visualização:</h3>
                      <div className="aspect-video w-full max-w-2xl bg-black rounded-lg overflow-hidden">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${formData.youtubeVideoId}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-md"
                        ></iframe>
                      </div>
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Dicas para vídeos eficazes:</h4>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                          <li>Certifique-se de que o vídeo está público ou não listado no YouTube</li>
                          <li>Vídeos curtos (5-15 minutos) têm maior taxa de conclusão</li>
                          <li>Use legendas para melhorar a acessibilidade</li>
                          <li>Inclua uma introdução clara sobre o que será abordado</li>
                          <li>Termine com um resumo dos pontos principais</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(formData.contentType === "TEXT" || formData.contentType === "QUIZ") && (
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Conteúdo da Aula *
                  </label>
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Dicas para conteúdo em texto:</h4>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                      <li>Use títulos e subtítulos para organizar o conteúdo</li>
                      <li>Inclua imagens e diagramas para ilustrar conceitos complexos</li>
                      <li>Destaque informações importantes em negrito ou itálico</li>
                      <li>Use listas para apresentar passos ou pontos-chave</li>
                      <li>Adicione links para recursos externos relevantes</li>
                    </ul>
                  </div>
                  <div className="min-h-[400px] border border-gray-300 rounded-md overflow-hidden">
                    <TipTapEditor
                      value={formData.content}
                      onChange={handleContentChange}
                      className="h-96"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {currentTab === "files" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivos para Download
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Faça upload de um arquivo</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileUpload}
                          disabled={isLoading}
                        />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, PPT, ZIP, etc. até 50MB
                    </p>
                  </div>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Arquivos Adicionados:</h3>
                  <ul className="divide-y divide-gray-200">
                    {uploadedFiles.map((file, index) => (
                      <li key={index} className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="ml-2 text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="mt-2">
                          <label htmlFor={`file-description-${index}`} className="block text-sm font-medium text-gray-700">
                            Descrição do arquivo
                          </label>
                          <input
                            type="text"
                            id={`file-description-${index}`}
                            value={file.description}
                            onChange={(e) => handleFileDescriptionChange(index, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Ex: Material complementar, Slides da aula, etc."
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-end space-x-3">
            <Link
              href={`/admin/cursos/${courseId}/aulas`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Salvando..." : "Salvar Aula"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 