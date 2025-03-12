import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileText, 
  List, 
  Lock, 
  Play,
  Clock
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Função para buscar curso pelo slug
async function getCourse(slug: string) {
  const course = await prisma.course.findFirst({
    where: {
      OR: [
        { slug },
        { id: slug }
      ]
    },
    include: {
      teacher: {
        select: {
          name: true,
          image: true,
        },
      },
      category: true,
    },
  });

  return course;
}

// Função para buscar aula pelo ID
async function getChapter(courseId: string, chapterId: string) {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
      courseId,
    },
    include: {
      downloadFiles: true,
    },
  });

  return chapter;
}

// Função para buscar todas as aulas do curso
async function getCourseChapters(courseId: string) {
  const chapters = await prisma.chapter.findMany({
    where: {
      courseId,
    },
    orderBy: {
      position: "asc",
    },
    select: {
      id: true,
      title: true,
      position: true,
      isPublished: true,
      isPreview: true,
      contentType: true,
      duration: true,
    },
  });

  return chapters;
}

// Função para verificar se o usuário está matriculado no curso
async function isEnrolled(userId: string, courseId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  return !!enrollment;
}

export default async function ChapterPage({ 
  params 
}: { 
  params: { slug: string; chapterId: string } 
}) {
  const session = await getServerSession(authOptions);
  const { slug, chapterId } = params;

  // Buscar o curso
  const course = await getCourse(slug);
  if (!course) {
    redirect("/cursos");
  }

  // Buscar a aula
  const chapter = await getChapter(course.id, chapterId);
  if (!chapter) {
    redirect(`/cursos/${slug}`);
  }

  // Buscar todas as aulas do curso
  const chapters = await getCourseChapters(course.id);

  // Verificar se o usuário está matriculado no curso
  const userIsEnrolled = session?.user?.id 
    ? await isEnrolled(session.user.id, course.id) 
    : false;

  // Verificar se o usuário tem acesso à aula
  const isPreview = chapter.isPreview;
  const hasAccess = userIsEnrolled || isPreview || session?.user?.role === "ADMIN";

  if (!hasAccess) {
    redirect(`/cursos/${slug}`);
  }

  // Encontrar a posição atual da aula na lista
  const currentIndex = chapters.findIndex(c => c.id === chapterId);
  const previousChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  // Verificar se o usuário tem acesso ao próximo capítulo
  const canAccessNextChapter = nextChapter && (userIsEnrolled || nextChapter.isPreview || session?.user?.role === "ADMIN");

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Cabeçalho */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href={`/cursos/${slug}`} className="flex items-center text-gray-700 hover:text-blue-600">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Voltar para o curso
          </Link>
          <div className="text-sm text-gray-500 flex items-center">
            <span className="hidden md:inline">Aula</span> {chapter.position} de {chapters.length}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Conteúdo principal */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Vídeo ou conteúdo principal */}
                {chapter.contentType === "VIDEO" && chapter.youtubeVideoId && (
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${chapter.youtubeVideoId}`}
                      title={chapter.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                )}

                {/* Título e descrição */}
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      {chapter.contentType === "VIDEO" ? (
                        <Play className="h-5 w-5 text-blue-600" />
                      ) : (
                        <FileText className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{chapter.title}</h1>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{chapter.duration} minutos</span>
                        {chapter.isPreview && (
                          <span className="ml-3 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Prévia
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {chapter.description && (
                    <div className="mb-6 text-gray-600 border-b border-gray-200 pb-6">
                      {chapter.description}
                    </div>
                  )}

                  {/* Conteúdo em texto */}
                  {chapter.contentType === "TEXT" && chapter.content && (
                    <div 
                      className="prose prose-blue max-w-none mt-6"
                      dangerouslySetInnerHTML={{ __html: chapter.content }}
                    />
                  )}

                  {/* Arquivos para download */}
                  {chapter.downloadFiles && chapter.downloadFiles.length > 0 && (
                    <div className="mt-8 border-t border-gray-200 pt-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Download className="h-5 w-5 mr-2 text-blue-600" />
                        Materiais para download
                      </h2>
                      <div className="space-y-3">
                        {chapter.downloadFiles.map((file) => (
                          <div key={file.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-shrink-0 mr-3">
                              <FileText className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="flex-grow">
                              <h3 className="text-sm font-medium">{file.name}</h3>
                              {file.description && (
                                <p className="text-xs text-gray-500">{file.description}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <a
                              href={file.url}
                              download={file.name}
                              className="flex-shrink-0 ml-4 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-5 w-5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Navegação entre aulas */}
                <div className="border-t border-gray-200 p-4 flex justify-between bg-gray-50">
                  {previousChapter ? (
                    <Link
                      href={`/cursos/${slug}/aulas/${previousChapter.id}`}
                      className="flex items-center text-blue-600 hover:text-blue-800 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5 mr-1" />
                      <span>
                        <span className="block text-xs text-gray-500">Anterior</span>
                        <span className="font-medium">{previousChapter.title.length > 25 ? previousChapter.title.substring(0, 25) + '...' : previousChapter.title}</span>
                      </span>
                    </Link>
                  ) : (
                    <div></div>
                  )}

                  {nextChapter && (
                    <Link
                      href={canAccessNextChapter ? `/cursos/${slug}/aulas/${nextChapter.id}` : `/cursos/${slug}`}
                      className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                        canAccessNextChapter 
                          ? "text-blue-600 hover:text-blue-800 hover:bg-blue-50" 
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <span className="text-right">
                        <span className="block text-xs text-gray-500">Próxima</span>
                        <span className="font-medium">{nextChapter.title.length > 25 ? nextChapter.title.substring(0, 25) + '...' : nextChapter.title}</span>
                      </span>
                      {canAccessNextChapter ? (
                        <ChevronRight className="h-5 w-5 ml-1" />
                      ) : (
                        <Lock className="h-4 w-4 ml-1" />
                      )}
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Barra lateral */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-20">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-semibold flex items-center">
                    <List className="h-5 w-5 mr-2 text-blue-600" />
                    Conteúdo do curso
                  </h2>
                </div>

                <div className="divide-y divide-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {chapters.map((c) => {
                    const isActive = c.id === chapterId;
                    const canAccess = userIsEnrolled || c.isPreview || session?.user?.role === "ADMIN";

                    return (
                      <div 
                        key={c.id} 
                        className={`p-4 ${isActive ? "bg-blue-50" : ""} hover:bg-gray-50 transition-colors`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            {isActive ? (
                              <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                                <Play className="h-3 w-3 text-white" fill="white" />
                              </div>
                            ) : canAccess ? (
                              <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
                                <Lock className="h-3 w-3 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3 flex-grow">
                            <Link
                              href={canAccess ? `/cursos/${slug}/aulas/${c.id}` : `/cursos/${slug}`}
                              className={`block ${
                                isActive 
                                  ? "text-blue-600 font-medium" 
                                  : canAccess 
                                    ? "text-gray-700 hover:text-blue-600" 
                                    : "text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              {c.title}
                            </Link>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <span className="flex items-center">
                                {c.contentType === "VIDEO" ? (
                                  <Play className="h-3 w-3 mr-1" />
                                ) : (
                                  <FileText className="h-3 w-3 mr-1" />
                                )}
                                {c.contentType === "VIDEO" ? "Vídeo" : "Texto"}
                              </span>
                              <span className="mx-2">•</span>
                              <span>{c.duration} min</span>
                              {c.isPreview && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="text-green-600 font-medium">Prévia</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Informações do curso */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2">{course.title}</h2>
                  <div className="flex items-center mt-4">
                    {course.teacher.image && (
                      <Image
                        src={course.teacher.image}
                        alt={course.teacher.name || "Professor"}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <div className="ml-2">
                      <p className="text-sm font-medium">{course.teacher.name}</p>
                      <p className="text-xs text-gray-500">Professor</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link 
                      href={`/cursos/${slug}`}
                      className="block w-full text-center py-2 px-4 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      Ver detalhes do curso
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 