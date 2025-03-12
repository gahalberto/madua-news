import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, StarHalf, Clock, Play, ChevronLeft, ChevronRight, Search, BookOpen, Users, Award } from 'lucide-react';
import EnrollButton from "@/app/_components/courses/EnrollButton";

interface Category {
  id: string;
  name: string;
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

async function getCourses() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/courses?published=true`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error('Falha ao buscar cursos');
    }
    
    return res.json();
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/categories`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error('Falha ao buscar categorias');
    }
    
    return res.json();
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
}

export default async function CoursesPage() {
  const [courses, categories] = await Promise.all([getCourses(), getCategories()]);
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section - Estilo Luma */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Explore Nossos Cursos</h1>
            <p className="text-xl mb-8">
              Aprenda novas habilidades, expanda seu conhecimento e alcance seus objetivos profissionais com nossos cursos de alta qualidade.
            </p>
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="O que você quer aprender hoje?"
                className="w-full px-6 py-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-lg"
              />
              <button className="absolute right-2 top-2 bg-indigo-700 hover:bg-indigo-800 text-white p-2 rounded-full">
                <Search className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{courses.length}+</div>
                <div className="text-gray-600">Cursos Disponíveis</div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Users className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-800">10,000+</div>
                <div className="text-gray-600">Alunos Ativos</div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Award className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-800">95%</div>
                <div className="text-gray-600">Taxa de Satisfação</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b">Filtros</h3>
              
              {/* Categorias */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Categorias</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input type="checkbox" id="all-categories" className="h-4 w-4 text-indigo-600 rounded" />
                    <label htmlFor="all-categories" className="ml-2 text-gray-700">Todas as Categorias</label>
                  </div>
                  {categories.map((category: Category) => (
                    <div key={category.id} className="flex items-center">
                      <input type="checkbox" id={`category-${category.id}`} className="h-4 w-4 text-indigo-600 rounded" />
                      <label htmlFor={`category-${category.id}`} className="ml-2 text-gray-700">{category.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Preço */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Preço</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input type="checkbox" id="price-all" className="h-4 w-4 text-indigo-600 rounded" />
                    <label htmlFor="price-all" className="ml-2 text-gray-700">Todos os Preços</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="price-free" className="h-4 w-4 text-indigo-600 rounded" />
                    <label htmlFor="price-free" className="ml-2 text-gray-700">Gratuito</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="price-paid" className="h-4 w-4 text-indigo-600 rounded" />
                    <label htmlFor="price-paid" className="ml-2 text-gray-700">Pago</label>
                  </div>
                </div>
              </div>
              
              {/* Nível */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Nível</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input type="checkbox" id="level-all" className="h-4 w-4 text-indigo-600 rounded" />
                    <label htmlFor="level-all" className="ml-2 text-gray-700">Todos os Níveis</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="level-beginner" className="h-4 w-4 text-indigo-600 rounded" />
                    <label htmlFor="level-beginner" className="ml-2 text-gray-700">Iniciante</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="level-intermediate" className="h-4 w-4 text-indigo-600 rounded" />
                    <label htmlFor="level-intermediate" className="ml-2 text-gray-700">Intermediário</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="level-advanced" className="h-4 w-4 text-indigo-600 rounded" />
                    <label htmlFor="level-advanced" className="ml-2 text-gray-700">Avançado</label>
                  </div>
                </div>
              </div>
              
              {/* Botão de Limpar Filtros */}
              <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                Limpar Filtros
              </button>
            </div>
          </div>
          
          {/* Course Grid */}
          <div className="lg:w-3/4">
            {/* Sorting Options */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-8 flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <span className="text-gray-600">Mostrando <span className="font-semibold">{courses.length}</span> cursos</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Ordenar por:</span>
                <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="newest">Mais recentes</option>
                  <option value="popular">Mais populares</option>
                  <option value="price-low">Preço: Menor para Maior</option>
                  <option value="price-high">Preço: Maior para Menor</option>
                </select>
              </div>
            </div>
            
            {/* Course Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course: Course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            
            {/* Pagination */}
            {courses.length > 0 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-lg">
                    1
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg">
                    2
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg">
                    3
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Não encontrou o que procura?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Entre em contato conosco e informe qual curso você gostaria de ver em nossa plataforma.
            </p>
            <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md">
              Solicitar um Curso
            </button>
          </div>
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

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md border border-gray-100">
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
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-indigo-100 to-purple-100">
                <span className="text-indigo-500 font-bold text-2xl">{course.title.substring(0, 2).toUpperCase()}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="bg-indigo-600 text-white p-3 rounded-full">
                <Play className="h-6 w-6" />
              </div>
            </div>
          </div>
        </Link>
        {course.promotionalPrice !== null && (
          <div className="absolute top-4 left-4">
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              OFERTA
            </div>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-5">
        {/* Category Badge */}
        {course.category && (
          <div className="mb-3">
            <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
              {course.category.name}
            </span>
          </div>
        )}
        
        <Link href={courseUrl}>
          <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-indigo-600 line-clamp-2">{course.title}</h3>
        </Link>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {renderStars()}
            <span className="text-sm text-gray-500 ml-1">4.0</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>{course._count?.chapters || 0} aulas</span>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold text-indigo-600">
              {formatPrice(course.price, course.promotionalPrice)}
            </div>
            <EnrollButton 
              courseId={course.id}
              courseTitle={course.title}
              coursePrice={course.price}
              coursePromotionalPrice={course.promotionalPrice}
              courseImage={course.imageUrl}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 