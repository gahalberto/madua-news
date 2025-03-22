import { db } from "@/lib/db";
import CourseClientComponent from "@/app/_components/courses/CourseClientComponent";
import Link from 'next/link';
import Image from 'next/image';
import { Star, StarHalf, Clock, Play, CheckCircle, Users, BookOpen, Award, Video, FileText, Lock } from 'lucide-react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EnrollButton from "@/app/_components/courses/EnrollButton";
import { Metadata } from 'next';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SocialShare } from '@/components/SocialShare';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Course, Chapter, Prisma } from '@prisma/client';

interface CoursePageProps {
  params: {
    slug: string
  }
}

type CourseWithChapters = Course & {
  chapters: Chapter[];
}

// Funções para buscar dados
async function getCourse(slug: string): Promise<Course | null> {
  try {
    const course = await db.course.findUnique({
      where: {
        slug: slug,
      },
      include: {
        lessons: true,
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

export default async function CoursePage({ params }: CoursePageProps) {
  const session = await getServerSession(authOptions)
  const course = await prisma.course.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      chapters: true
    }
  })

  if (!course) {
    notFound()
  }

  // Ordenar os capítulos por posição
  const sortedChapters = [...course.chapters].sort((a, b) => a.position - b.position)
  const typedCourse = { ...course, chapters: sortedChapters } as CourseWithChapters
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madua.com.br'
  const shareUrl = `${baseUrl}/cursos/${typedCourse.slug}`
  const shareTitle = typedCourse.title

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">{typedCourse.title}</h1>
          <div className="flex items-center text-gray-600">
            <div className="flex items-center gap-4">
              <time dateTime={typedCourse.createdAt.toISOString()}>
                {format(typedCourse.createdAt, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </time>
              <span>•</span>
              <span>{typedCourse.chapters.length} aulas</span>
            </div>
          </div>
        </header>

        <div className="prose prose-lg mx-auto mb-8">
          {typedCourse.description}
        </div>

        <div className="flex items-center justify-between mb-8">
          <EnrollButton
            courseId={typedCourse.id}
            courseTitle={typedCourse.title}
            coursePrice={typedCourse.price}
            coursePromotionalPrice={typedCourse.promotionalPrice}
            courseImage={typedCourse.imageUrl}
          />
          <SocialShare url={shareUrl} title={shareTitle} />
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">Aulas do curso</h2>
          <div className="space-y-4">
            {typedCourse.chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="rounded-lg border p-4 hover:bg-gray-50"
              >
                <h3 className="text-lg font-semibold">{chapter.title}</h3>
                <p className="mt-2 text-gray-600">{chapter.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 