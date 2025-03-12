import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, StarHalf, Clock, Play, Filter } from 'lucide-react';
import { notFound } from 'next/navigation';

// Função para buscar categoria pelo ID
async function getCategory(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/categories/${id}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return null;
  }
}

// Função para buscar cursos por categoria
async function getCoursesByCategory(categoryId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/courses?categoryId=${categoryId}&published=true`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return [];
    }
    
    return res.json();
  } catch (error) {
    console.error('Erro ao buscar cursos por categoria:', error);
    return [];
  }
}

interface Course {
  id: string;
  title: string;
  description: string;
  slug: string | null;
  imageUrl: string | null;
  price: number | null;
  promotionalPrice: number | null;
  isPublished: boolean;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    chapters: number;
    enrollments: number;
  };
}

export default async function CategoryCoursesPage({ params }: { params: { id: string } }) {
  const { id } = await Promise.resolve(params);
  const category = await getCategory(id);
  
  if (!category) {
    notFound();
  }
  
  const courses = await getCoursesByCategory(id);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-4">
            <Link href="/cursos" className="text-blue-200 hover:text-white">
              Cursos
            </Link>
            <span className="mx-2">›</span>
            <span className="text-white">{category.name}</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Cursos de {category.name}</h1>
          <p className="text-xl max-w-2xl">
            Explore nossa seleção de cursos de {category.name} e aprenda com os melhores professores.
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar cursos..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700 font-medium">Filtros</span>
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Todos os níveis</option>
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="newest">Mais recentes</option>
                <option value="popular">Mais populares</option>
                <option value="price-low">Preço: Menor para Maior</option>
                <option value="price-high">Preço: Maior para Menor</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Course Listings */}
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {courses.length} {courses.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
          </h2>
          
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course: Course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum curso encontrado</h3>
              <p className="text-gray-600 mb-4">
                Não encontramos cursos nesta categoria. Por favor, tente outra categoria ou volte mais tarde.
              </p>
              <Link
                href="/cursos"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
              >
                Ver todos os cursos
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  // Função para formatar preço
  const formatPrice = (price: number | null, promotionalPrice: number | null) => {
    if (price === null) return "Gratuito";
    
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    
    if (promotionalPrice !== null) {
      return (
        <div>
          <span className="line-through text-gray-500 mr-2">{formatter.format(price)}</span>
          <span className="text-green-600 font-bold">{formatter.format(promotionalPrice)}</span>
        </div>
      );
    }
    
    return formatter.format(price);
  };

  // Função para renderizar estrelas de avaliação
  const renderStars = (rating = 4) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 text-yellow-500 fill-current" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 text-yellow-500 fill-current" />);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  // Determinar a URL do curso (priorizar o slug)
  const courseUrl = course.slug ? `/cursos/${course.slug}` : `/cursos/${course.id}`;
  
  // Verificar se o curso tem slug, caso contrário, mostrar um aviso no console
  if (!course.slug) {
    console.warn(`Curso sem slug: ${course.title} (ID: ${course.id})`);
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:transform hover:scale-105">
      <div className="relative">
        <Link href={courseUrl}>
          <div className="h-48 bg-gray-200 relative">
            {course.imageUrl ? (
              <Image
                src={course.imageUrl}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100">
                <span className="text-blue-500 font-bold text-xl">{course.title.substring(0, 2).toUpperCase()}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="bg-blue-600 text-white p-3 rounded-full">
                <Play className="h-6 w-6" />
              </div>
            </div>
          </div>
        </Link>
        <div className="absolute top-4 right-4">
          <button className="text-white hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            {renderStars()}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>6 horas</span>
          </div>
        </div>
        
        <Link href={courseUrl}>
          <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-blue-600">{course.title}</h3>
        </Link>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
        
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold">
              {formatPrice(course.price, course.promotionalPrice)}
            </div>
            <Link 
              href={courseUrl}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Ver curso
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 