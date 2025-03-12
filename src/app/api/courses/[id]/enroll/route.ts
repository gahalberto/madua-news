import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar se o usuário está autenticado
    if (!session?.user) {
      return NextResponse.json(
        { error: "Você precisa estar logado para se matricular em um curso" },
        { status: 401 }
      );
    }
    
    const courseId = params.id;
    const userId = session.user.id;
    
    // Verificar se o curso existe
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    
    if (!course) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário já está matriculado
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
    
    if (existingEnrollment) {
      return NextResponse.json(
        { message: "Você já está matriculado neste curso" },
        { status: 200 }
      );
    }
    
    // Criar a matrícula
    await prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });
    
    // Redirecionar para a primeira aula do curso
    const firstChapter = await prisma.chapter.findFirst({
      where: {
        courseId,
        isPublished: true,
      },
      orderBy: {
        position: "asc",
      },
    });
    
    // Obter o slug do curso para o redirecionamento
    const courseWithSlug = await prisma.course.findUnique({
      where: { id: courseId },
      select: { slug: true },
    });
    
    const redirectUrl = firstChapter 
      ? `/cursos/${courseWithSlug?.slug || courseId}/aulas/${firstChapter.id}`
      : `/cursos/${courseWithSlug?.slug || courseId}`;
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Matrícula realizada com sucesso",
        redirectUrl 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[COURSE_ENROLL]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 