import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface ChapterFile {
  id?: string;
  name: string;
  url: string;
  size: number;
  type: string;
  description: string;
}

// GET /api/courses/[id]/chapters/[chapterId] - Obter detalhes de uma aula
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  try {
    const { id, chapterId } = await Promise.resolve(params);

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

    // Buscar a aula
    const chapter = await prisma.chapter.findUnique({
      where: { 
        id: chapterId,
        courseId: id,
      },
      include: {
        downloadFiles: true,
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { error: "Aula não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("[CHAPTER_GET]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[id]/chapters/[chapterId] - Atualizar uma aula
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
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

    const { id, chapterId } = await Promise.resolve(params);
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
      downloadFiles = [],
      filesToDelete = []
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

    // Verificar se a aula existe
    const existingChapter = await prisma.chapter.findUnique({
      where: { 
        id: chapterId,
        courseId: id,
      },
    });

    if (!existingChapter) {
      return NextResponse.json(
        { error: "Aula não encontrada" },
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

    // Atualizar a aula
    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
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
      },
    });

    // Excluir arquivos marcados para exclusão
    if (filesToDelete.length > 0) {
      await prisma.chapterFile.deleteMany({
        where: {
          id: {
            in: filesToDelete,
          },
        },
      });
    }

    // Adicionar novos arquivos para download
    const newFiles = downloadFiles.filter((file: ChapterFile) => !file.id);
    if (newFiles.length > 0) {
      await Promise.all(
        newFiles.map((file: ChapterFile) =>
          prisma.chapterFile.create({
            data: {
              name: file.name,
              url: file.url,
              size: file.size,
              type: file.type,
              description: file.description,
              chapterId,
            },
          })
        )
      );
    }

    // Atualizar arquivos existentes
    const existingFiles = downloadFiles.filter((file: ChapterFile) => file.id);
    if (existingFiles.length > 0) {
      await Promise.all(
        existingFiles.map((file: ChapterFile) =>
          prisma.chapterFile.update({
            where: { id: file.id },
            data: {
              name: file.name,
              url: file.url,
              size: file.size,
              type: file.type,
              description: file.description,
            },
          })
        )
      );
    }

    return NextResponse.json(updatedChapter);
  } catch (error) {
    console.error("[CHAPTER_PATCH]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]/chapters/[chapterId] - Excluir uma aula
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
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

    const { id, chapterId } = await Promise.resolve(params);

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

    // Verificar se a aula existe
    const chapter = await prisma.chapter.findUnique({
      where: { 
        id: chapterId,
        courseId: id,
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { error: "Aula não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o professor do curso ou um administrador
    const isAuthorized = 
      course.teacherId === session.user.id || 
      session.user.role === "ADMIN";

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Não autorizado a excluir esta aula" },
        { status: 403 }
      );
    }

    // Excluir a aula (os arquivos serão excluídos automaticamente devido à relação onDelete: Cascade)
    await prisma.chapter.delete({
      where: { id: chapterId },
    });

    // Reordenar as aulas restantes
    const remainingChapters = await prisma.chapter.findMany({
      where: { courseId: id },
      orderBy: { position: "asc" },
    });

    // Atualizar as posições
    await Promise.all(
      remainingChapters.map((chapter, index) =>
        prisma.chapter.update({
          where: { id: chapter.id },
          data: { position: index + 1 },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CHAPTER_DELETE]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 