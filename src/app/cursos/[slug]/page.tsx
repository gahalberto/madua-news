import { db } from "@/lib/db";
import CourseClientComponent from "@/app/_components/courses/CourseClientComponent";
import Link from 'next/link';
import Image from 'next/image';
import { Star, StarHalf, Clock, Play, CheckCircle, Users, BookOpen, Award, Video, FileText, Lock } from 'lucide-react';
import { notFound } from 'next/navigation';
import prisma from "@/lib/prisma";
import EnrollButton from "@/app/_components/courses/EnrollButton";
import { Metadata } from 'next';

// Interfaces para tipagem
interface Chapter {
  id: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  position: number;
  isPublished: boolean;
  contentType: string;
  duration: number;
  isPreview: boolean;
  youtubeVideoId?: string | null;
  content?: string | null;
  courseId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number | null;
  promotionalPrice: number | null;
  imageUrl: string | null;
  slug: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  isPublished: boolean;
  duration?: number;
  hasCertificate?: boolean;
  learningPoints?: string[];
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  teacher?: {
    id: string;
    name: string;
    image: string | null;
    bio?: string;
  } | null;
  _count?: {
    chapters: number;
    enrollments: number;
    reviews?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Funções para buscar dados
async function getCourse(slug: string): Promise<Course | null> {
  try {
    const course = await db.course.findUnique({
      where: {
        slug: slug,
      },
    });
    
    return course;
  } catch (error) {
    console.error("Erro ao buscar curso:", error);
    return null;
  }
}

async function getCourseChapters(courseId: string): Promise<Chapter[]> {
  try {
    const chapters = await db.chapter.findMany({
      where: {
        courseId: courseId,
        isPublished: true,
      },
      orderBy: {
        position: 'asc',
      },
    });
    
    return chapters;
  } catch (error) {
    console.error("Erro ao buscar capítulos:", error);
    return [];
  }
}

async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
  if (!userId) return false;
  
  try {
    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: userId,
        courseId: courseId,
      },
    });
    
    return !!enrollment;
  } catch (error) {
    console.error("Erro ao verificar matrícula:", error);
    return false;
  }
}

// Função para encontrar a primeira aula de prévia do curso
async function getFirstPreviewChapter(courseId: string) {
  try {
    const previewChapter = await prisma.chapter.findFirst({
      where: {
        courseId,
        isPublished: true,
        isPreview: true,
      },
      orderBy: {
        position: 'asc',
      },
    });
    
    return previewChapter;
  } catch (error) {
    console.error('Erro ao buscar aula de prévia:', error);
    return null;
  }
}

// Gerar metadados para SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;
  const courseData = await getCourse(slug);
  
  if (!courseData) {
    return {
      title: 'Curso não encontrado',
      description: 'O curso que você está procurando não existe ou foi removido.'
    };
  }
  
  return {
    title: `${courseData.title} | Curso Online`,
    description: courseData.metaDescription || courseData.description.substring(0, 160),
    openGraph: {
      title: courseData.title,
      description: courseData.metaDescription || courseData.description.substring(0, 160),
      images: courseData.imageUrl ? [{ url: courseData.imageUrl }] : undefined
    }
  };
}

export default async function CoursePage({
  params,
}: {
  params: { 
    slug: string;
    session?: {
      user?: {
        id: string;
      }
    } 
  };
}) {
  const slug = params.slug;
  const courseData = await getCourse(slug);
  
  if (!courseData) {
    notFound();
  }
  
  const chapters = await getCourseChapters(courseData.id);
  const userEnrolled = params.session?.user?.id 
    ? await isEnrolled(params.session.user.id, courseData.id) 
    : false;
  const firstPreviewChapter = await getFirstPreviewChapter(courseData.id);
  
  // Função para formatar preço
  const formatPrice = (price: number | null, promotionalPrice: number | null) => {
    if (price === null) return "Gratuito";
    
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    
    if (promotionalPrice !== null) {
      return (
        <div className="flex flex-col">
          <span className="line-through text-gray-500">{formatter.format(price)}</span>
          <span className="text-green-600 font-bold text-2xl">{formatter.format(promotionalPrice)}</span>
        </div>
      );
    }
    
    return <span className="text-2xl font-bold">{formatter.format(price)}</span>;
  };

  // Função para renderizar estrelas de avaliação
  const renderStars = (rating = 4.5) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-5 w-5 text-yellow-500 fill-current" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-5 w-5 text-yellow-500 fill-current" />);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-5 w-5 text-gray-300" />);
    }
    
    return stars;
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <div className="flex items-center mb-4">
                <Link href="/cursos" className="text-blue-200 hover:text-white">
                  Cursos
                </Link>
                <span className="mx-2">›</span>
                {courseData.category && (
                  <>
                    <Link href={`/cursos/categoria/${courseData.category.id}`} className="text-blue-200 hover:text-white">
                      {courseData.category.name}
                    </Link>
                    <span className="mx-2">›</span>
                  </>
                )}
                <span className="text-white">{courseData.title}</span>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{courseData.title}</h1>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center mr-4">
                  {renderStars()}
                  <span className="ml-2">4.5 (128 avaliações)</span>
                </div>
                <div className="flex items-center mr-4">
                  <Users className="h-5 w-5 mr-1" />
                  <span>{courseData._count?.enrollments || 0} alunos</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-1" />
                  <span>{chapters.length} aulas</span>
                </div>
              </div>
              
              <p className="text-lg mb-6">
                {courseData.metaDescription || courseData.description.substring(0, 160)}
              </p>
              
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                    {courseData.teacher?.image ? (
                      <Image
                        src={courseData.teacher.image}
                        alt={courseData.teacher.name || 'Professor'}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-white font-bold">
                        {courseData.teacher?.name?.substring(0, 2).toUpperCase() || 'P'}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-blue-200">Criado por</p>
                  <p className="font-medium">{courseData.teacher?.name || 'Professor'}</p>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/3">
              <div className="bg-white rounded-lg shadow-lg p-6 text-gray-800">
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  {courseData.imageUrl ? (
                    <Image
                      src={courseData.imageUrl}
                      alt={courseData.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100">
                      <span className="text-blue-500 font-bold text-3xl">{courseData.title.substring(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <div className="bg-blue-600 text-white p-4 rounded-full">
                      <Play className="h-8 w-8" />
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  {formatPrice(courseData.price, courseData.promotionalPrice)}
                </div>
                
                {userEnrolled ? (
                  <Link 
                    href={`/cursos/${slug}/aulas/${chapters[0]?.id || ''}`}
                    className="w-full py-3 bg-green-600 text-white rounded-md font-bold mb-4 hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Continuar Aprendendo
                  </Link>
                ) : (
                  <EnrollButton
                    courseId={courseData.id}
                    courseTitle={courseData.title}
                    coursePrice={courseData.price}
                    coursePromotionalPrice={courseData.promotionalPrice}
                    courseImage={courseData.imageUrl}
                    className="w-full py-3"
                  />
                )}
                
                {firstPreviewChapter && !userEnrolled && (
                  <Link
                    href={`/cursos/${slug}/aulas/${firstPreviewChapter.id}`}
                    className="w-full py-3 border border-blue-600 text-blue-600 rounded-md font-bold hover:bg-blue-50 transition-colors flex items-center justify-center"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Experimentar Grátis
                  </Link>
                )}
                
                <div className="mt-6 text-sm text-gray-600">
                  <p className="mb-2 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Acesso vitalício
                  </p>
                  {courseData.hasCertificate && (
                    <p className="mb-2 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Certificado de conclusão
                    </p>
                  )}
                  <p className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Suporte do instrutor
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Sobre este curso</h2>
              <div className="prose max-w-none">
                <p className="mb-4">{courseData.description}</p>
              </div>
            </div>

            {/* Pontos de aprendizado */}
            {courseData.learningPoints && courseData.learningPoints.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">O que você vai aprender</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courseData.learningPoints.map((point: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conteúdo do curso - Aulas */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Conteúdo do curso</h2>
              
              {chapters.length === 0 ? (
                <p className="text-gray-500">Nenhuma aula disponível ainda.</p>
              ) : (
                <div className="space-y-4">
                  {chapters.filter((chapter: Chapter) => chapter.isPublished).map((chapter: Chapter, index: number) => (
                    <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 flex justify-between items-center">
                        <h3 className="font-medium">
                          Aula {index + 1}: {chapter.title}
                        </h3>
                        <div className="flex items-center">
                          {chapter.contentType === "VIDEO" ? (
                            <Video className="h-4 w-4 text-blue-500 mr-2" />
                          ) : (
                            <FileText className="h-4 w-4 text-green-500 mr-2" />
                          )}
                          <span className="text-sm text-gray-500 mr-4">{chapter.duration} min</span>
                          
                          {chapter.isPreview ? (
                            <Link 
                              href={`/cursos/${slug}/aulas/${chapter.id}`}
                              className="flex items-center text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Prévia gratuita
                            </Link>
                          ) : (
                            <div className="flex items-center text-sm text-gray-500">
                              <Lock className="h-3 w-3 mr-1" />
                              Acesso exclusivo
                            </div>
                          )}
                        </div>
                      </div>
                      {chapter.description && (
                        <div className="p-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">{chapter.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Informações do professor */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Sobre o professor</h2>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                    {courseData.teacher?.image ? (
                      <Image
                        src={courseData.teacher.image}
                        alt={courseData.teacher.name || 'Professor'}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-white font-bold text-xl">
                        {courseData.teacher?.name?.substring(0, 2).toUpperCase() || 'P'}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{courseData.teacher?.name || 'Professor'}</h3>
                  <p className="text-gray-600">
                    {courseData.teacher?.bio || 'Informações sobre o professor não disponíveis.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Detalhes do curso</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium">Duração</p>
                    <p className="text-sm text-gray-600">
                      {courseData.duration ? `${courseData.duration} minutos` : "Duração não especificada"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium">Aulas</p>
                    <p className="text-sm text-gray-600">{chapters.length} aulas</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium">Alunos</p>
                    <p className="text-sm text-gray-600">{courseData._count?.enrollments || 0} matriculados</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium">Certificado</p>
                    <p className="text-sm text-gray-600">
                      {courseData.hasCertificate 
                        ? "Certificado incluso ao concluir o curso" 
                        : "Este curso não oferece certificado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Compartilhar</h3>
              <div className="flex space-x-4">
                <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </button>
                <button className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </button>
                <button className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm4.5 6.75h-1.513c-.96 0-1.237.42-1.237 1.2v1.65h2.775l-.375 2.85h-2.4v7.2h-2.85v-7.2h-2.4v-2.85h2.4v-1.8c0-2.4 1.5-3.75 3.75-3.75 1.05 0 1.95.075 2.25.15v2.55z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Componente cliente para interatividade */}
      <CourseClientComponent 
        course={courseData} 
        session={params.session}
      />
    </div>
  );
} 