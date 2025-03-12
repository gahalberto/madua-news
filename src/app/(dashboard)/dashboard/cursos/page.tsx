"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Laptop, AlertCircle, Search, Play, BookOpen, Clock, Calendar } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  image: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Chapter {
  id: string;
  title: string;
  position: number;
  isFree: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  teacher: Teacher;
  category: Category | null;
  chapters: Chapter[];
  purchaseDate: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/user/courses");
        
        if (!response.ok) {
          throw new Error("Falha ao carregar cursos");
        }
        
        const data = await response.json();
        setCourses(data);
        setError(null);
      } catch (error) {
        console.error("Erro ao buscar cursos:", error);
        setError("Não foi possível carregar seus cursos. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isMounted) {
      fetchCourses();
    }
  }, [isMounted]);

  // Filtrar cursos com base no termo de pesquisa
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.teacher?.name && course.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (course.category?.name && course.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Renderizar um placeholder durante a renderização do servidor
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Meus Cursos</h1>
        </div>
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Meus Cursos</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Plataforma de Aprendizado
          </span>
        </div>
      </div>

      {/* Barra de pesquisa */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
          placeholder="Pesquisar cursos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error && courses.length === 0 ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erro ao carregar cursos</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Laptop className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum curso encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Nenhum curso corresponde à sua pesquisa." : "Você ainda não adquiriu nenhum curso."}
          </p>
          <div className="mt-6">
            <Link
              href="/cursos"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Explorar cursos disponíveis
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 relative h-48 md:h-auto">
                  {course.imageUrl ? (
                    <Image
                      src={course.imageUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      <Laptop className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-6 md:w-2/3">
                  <div className="flex flex-col h-full">
                    <div>
                      {course.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                          {course.category.name}
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>Adquirido em: {course.purchaseDate}</span>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                      
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0">
                          {course.teacher.image ? (
                            <Image
                              src={course.teacher.image}
                              alt={course.teacher.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-500">
                                {course.teacher.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-2">
                          <p className="text-sm font-medium text-gray-900">{course.teacher.name}</p>
                          <p className="text-xs text-gray-500">Professor</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <BookOpen className="mr-1 h-4 w-4" />
                        <span>{course.chapters.length} {course.chapters.length === 1 ? 'capítulo' : 'capítulos'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <Link
                        href={`/curso/${course.id}`}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Continuar Aprendendo
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 