"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Book, ChevronRight, Search } from "lucide-react";

interface Course {
  id: string;
  title: string;
  chaptersCount: number;
  createdAt: string;
}

interface ApiCourse {
  id: string;
  title: string;
  createdAt: string;
  [key: string]: unknown;
}

export default function AdminChaptersPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Buscar cursos e contar aulas
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        if (!response.ok) {
          throw new Error("Erro ao buscar cursos");
        }
        
        const data = await response.json();
        
        // Adicionar contagem de aulas (simulado)
        // Em um ambiente real, isso viria da API
        const coursesWithChapters = data.map((course: ApiCourse) => ({
          ...course,
          chaptersCount: Math.floor(Math.random() * 10) + 1, // Simulação
        }));
        
        setCourses(coursesWithChapters);
      } catch (error) {
        console.error("Erro ao buscar cursos:", error);
        toast.error("Erro ao carregar cursos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filtrar cursos com base no termo de pesquisa
  const filteredCourses = courses.filter((course) => {
    return course.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
        <h1 className="text-2xl font-bold tracking-tight">Gerenciar Aulas</h1>
      </div>

      {/* Informações sobre como acessar aulas */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <Book className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Como gerenciar aulas</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>As aulas estão sempre associadas a um curso específico. Para gerenciar as aulas:</p>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>Selecione um curso da lista abaixo</li>
                <li>Clique em &quot;Gerenciar Aulas&quot; para ver, adicionar, editar ou excluir aulas do curso</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Pesquisa */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Pesquisar cursos..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Lista de Cursos */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Curso
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Aulas
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Data de Criação
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{course.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{course.chaptersCount} aulas</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(course.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/cursos/${course.id}/aulas`}
                        className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                      >
                        Gerenciar Aulas
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum curso encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 