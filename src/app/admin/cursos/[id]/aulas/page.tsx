"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { 
  Video, 
  FileText, 
  Edit, 
  Trash2, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff,
  Clock,
  Youtube,
  File
} from "lucide-react";
import Link from "next/link";

interface Chapter {
  id: string;
  title: string;
  description?: string;
  position: number;
  isPublished: boolean;
  contentType: string;
  duration: number;
  youtubeVideoId?: string;
  isPreview: boolean;
  downloadFiles: {
    id: string;
    name: string;
  }[];
}

interface Course {
  id: string;
  title: string;
}

export default function ChaptersPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // NOTA: Em versões futuras do Next.js, isso deve ser alterado para usar React.use(params)
  const courseId = params.id;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
          throw new Error("Erro ao carregar o curso");
        }
        const data = await response.json();
        setCourse(data);
      } catch (error) {
        console.error("Erro ao carregar curso:", error);
        toast.error("Erro ao carregar o curso");
      }
    };

    const fetchChapters = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/chapters`);
        if (!response.ok) {
          throw new Error("Erro ao carregar as aulas");
        }
        const data = await response.json();
        setChapters(data);
      } catch (error) {
        console.error("Erro ao carregar aulas:", error);
        toast.error("Erro ao carregar as aulas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
    fetchChapters();
  }, [courseId]);

  const handleReorder = async (chapterId: string, direction: "up" | "down") => {
    setIsReordering(true);
    
    try {
      const currentIndex = chapters.findIndex(chapter => chapter.id === chapterId);
      if (currentIndex === -1) return;
      
      const newPosition = direction === "up" 
        ? chapters[currentIndex].position - 1 
        : chapters[currentIndex].position + 1;
      
      const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ position: newPosition }),
      });

      if (!response.ok) {
        throw new Error("Erro ao reordenar a aula");
      }

      // Recarregar as aulas após a reordenação
      const chaptersResponse = await fetch(`/api/courses/${courseId}/chapters`);
      if (!chaptersResponse.ok) {
        throw new Error("Erro ao recarregar as aulas");
      }
      
      const updatedChapters = await chaptersResponse.json();
      setChapters(updatedChapters);
      toast.success("Aula reordenada com sucesso");
    } catch (error) {
      console.error("Erro ao reordenar aula:", error);
      toast.error("Erro ao reordenar a aula");
    } finally {
      setIsReordering(false);
    }
  };

  const handleTogglePublish = async (chapterId: string, isCurrentlyPublished: boolean) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished: !isCurrentlyPublished }),
      });

      if (!response.ok) {
        throw new Error("Erro ao alterar o status da aula");
      }

      // Atualizar o estado local
      setChapters(chapters.map(chapter => 
        chapter.id === chapterId 
          ? { ...chapter, isPublished: !isCurrentlyPublished } 
          : chapter
      ));

      toast.success(
        isCurrentlyPublished 
          ? "Aula despublicada com sucesso" 
          : "Aula publicada com sucesso"
      );
    } catch (error) {
      console.error("Erro ao alterar status da aula:", error);
      toast.error("Erro ao alterar o status da aula");
    }
  };

  const handleTogglePreview = async (chapterId: string, isCurrentlyPreview: boolean) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPreview: !isCurrentlyPreview }),
      });

      if (!response.ok) {
        throw new Error("Erro ao alterar o status de prévia da aula");
      }

      // Atualizar o estado local
      setChapters(chapters.map(chapter => 
        chapter.id === chapterId 
          ? { ...chapter, isPreview: !isCurrentlyPreview } 
          : chapter
      ));

      toast.success(
        isCurrentlyPreview 
          ? "Aula removida das prévias" 
          : "Aula definida como prévia"
      );
    } catch (error) {
      console.error("Erro ao alterar status de prévia:", error);
      toast.error("Erro ao alterar o status de prévia da aula");
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir a aula");
      }

      // Remover a aula do estado local
      setChapters(chapters.filter(chapter => chapter.id !== chapterId));
      toast.success("Aula excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir aula:", error);
      toast.error("Erro ao excluir a aula");
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case "VIDEO":
        return <Video className="h-5 w-5 text-blue-500" />;
      case "TEXT":
        return <FileText className="h-5 w-5 text-green-500" />;
      case "QUIZ":
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
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
          <h1 className="text-2xl font-bold">Aulas do Curso</h1>
          <p className="text-gray-600">{course?.title}</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/admin/cursos/${courseId}`}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Voltar para o curso
          </Link>
          <Link
            href={`/admin/cursos/${courseId}/aulas/nova`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 inline-block mr-1" />
            Nova Aula
          </Link>
        </div>
      </div>

      {chapters.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">Este curso ainda não possui aulas.</p>
          <Link
            href={`/admin/cursos/${courseId}/aulas/nova`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-1" />
            Adicionar primeira aula
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posição
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aula
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prévia
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arquivos
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chapters.map((chapter) => (
                <tr key={chapter.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{chapter.position}</span>
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleReorder(chapter.id, "up")}
                          disabled={chapter.position === 1 || isReordering}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReorder(chapter.id, "down")}
                          disabled={chapter.position === chapters.length || isReordering}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getContentTypeIcon(chapter.contentType)}
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">{chapter.title}</div>
                        {chapter.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{chapter.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {chapter.contentType === "VIDEO" && (
                        <div className="flex items-center">
                          <Youtube className="h-4 w-4 mr-1" />
                          Vídeo
                        </div>
                      )}
                      {chapter.contentType === "TEXT" && (
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          Texto
                        </div>
                      )}
                      {chapter.contentType === "QUIZ" && (
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          Quiz
                        </div>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {chapter.duration} min
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleTogglePublish(chapter.id, chapter.isPublished)}
                      className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                        chapter.isPublished
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      }`}
                    >
                      {chapter.isPublished ? (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Publicada
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Rascunho
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleTogglePreview(chapter.id, chapter.isPreview)}
                      className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                        chapter.isPreview
                          ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {chapter.isPreview ? (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Prévia
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Não é prévia
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {chapter.downloadFiles.length} arquivos
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/admin/cursos/${courseId}/aulas/${chapter.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
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