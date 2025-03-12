import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH /api/courses/[id]/chapters/[chapterId]/reorder - Reordenar uma aula
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
    const { position } = await req.json();

    // Verificar se a posição é um número válido
    if (typeof position !== "number" || position < 1) {
      return NextResponse.json(
        { error: "Posição inválida" },
        { status: 400 }
      );
    }

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
        { error: "Não autorizado a reordenar este curso" },
        { status: 403 }
      );
    }

    // Buscar todas as aulas do curso
    const chapters = await prisma.chapter.findMany({
      where: { courseId: id },
      orderBy: { position: "asc" },
    });

    // Verificar se a posição é válida
    if (position > chapters.length) {
      return NextResponse.json(
        { error: "Posição inválida" },
        { status: 400 }
      );
    }

    // Posição atual da aula
    const currentPosition = chapter.position;

    // Se a posição não mudou, não fazer nada
    if (currentPosition === position) {
      return NextResponse.json(chapter);
    }

    // Atualizar as posições das aulas
    if (currentPosition < position) {
      // Mover para baixo: diminuir a posição das aulas entre a posição atual e a nova posição
      await prisma.$transaction(
        chapters
          .filter(c => c.position > currentPosition && c.position <= position)
          .map(c => 
            prisma.chapter.update({
              where: { id: c.id },
              data: { position: c.position - 1 },
            })
          )
      );
    } else {
      // Mover para cima: aumentar a posição das aulas entre a nova posição e a posição atual
      await prisma.$transaction(
        chapters
          .filter(c => c.position >= position && c.position < currentPosition)
          .map(c => 
            prisma.chapter.update({
              where: { id: c.id },
              data: { position: c.position + 1 },
            })
          )
      );
    }

    // Atualizar a posição da aula
    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: { position },
    });

    return NextResponse.json(updatedChapter);
  } catch (error) {
    console.error("[CHAPTER_REORDER]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 