import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface ChapterFile {
  name: string;
  url: string;
  size: number;
  type: string;
  description: string;
}

// GET /api/courses/[id]/chapters - Listar todas as aulas de um curso
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);

    // Verificar se o curso existe
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    // Buscar todas as aulas do curso, ordenadas por posição
    const chapters = await prisma.chapter.findMany({
      where: { courseId: id },
      orderBy: { position: "asc" },
      include: {
        downloadFiles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error("[CHAPTERS_GET]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/chapters - Criar uma nova aula
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar se o usuário está autenticado
    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await Promise.resolve(params);
    const { 
      title, 
      description, 
      contentType, 
      duration, 
      youtubeVideoId, 
      content, 
      isPublished, 
      isPreview, 
      position,
      downloadFiles = []
    } = await req.json();

    // Verificar se o curso existe
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        teacher: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o professor do curso ou um administrador
    const isAuthorized = 
      course.teacherId === session.user.id || 
      session.user.role === "ADMIN";

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Não autorizado a editar este curso" },
        { status: 403 }
      );
    }

    // Criar a aula
    const chapter = await prisma.chapter.create({
      data: {
        title,
        description,
        contentType,
        duration,
        youtubeVideoId,
        content,
        isPublished,
        isPreview,
        position,
        courseId: id,
      },
    });

    // Adicionar arquivos para download, se houver
    if (downloadFiles.length > 0) {
      await Promise.all(
        downloadFiles.map((file: ChapterFile) =>
          prisma.chapterFile.create({
            data: {
              name: file.name,
              url: file.url,
              size: file.size,
              type: file.type,
              description: file.description,
              chapterId: chapter.id,
            },
          })
        )
      );
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("[CHAPTERS_POST]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 