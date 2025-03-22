import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import slugify from "slugify";

// Função para gerar slug único
async function generateUniqueSlug(title: string, currentId: string): Promise<string> {
  // Gerar slug base a partir do título
  const baseSlug = slugify(title, {
    lower: true,
    strict: true,
    locale: 'pt',
    remove: /[*+~.()'"!:@]/g
  });
  
  let slug = baseSlug;
  let counter = 1;
  
  // Verificar se o slug já existe (excluindo o curso atual)
  while (true) {
    const existingCourse = await prisma.course.findFirst({
      where: { 
        slug,
        id: { not: currentId }
      }
    });
    
    if (!existingCourse) break;
    
    // Se já existe, adicionar um número ao final
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

// GET /api/courses/[id] - Obter um curso específico
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);

    if (!id) {
      return NextResponse.json(
        { error: "ID do curso é obrigatório" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        teacher: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        chapters: {
          orderBy: {
            position: "asc",
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSE_GET]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[id] - Atualizar um curso
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await Promise.resolve(params);

    if (!id) {
      return NextResponse.json(
        { error: "ID do curso é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o curso existe
    const existingCourse = await prisma.course.findUnique({
      where: {
        id,
      },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    // Obter o primeiro usuário do banco de dados (solução temporária)
    const firstUser = await prisma.user.findFirst({
      where: {
        OR: [
          { role: "ADMIN" },
          { role: "TEACHER" }
        ]
      }
    });

    if (!firstUser) {
      return NextResponse.json(
        { error: "Nenhum usuário administrador ou professor encontrado" },
        { status: 400 }
      );
    }

    // Verificar se o usuário é o professor do curso ou um administrador
    if (
      existingCourse.teacherId !== firstUser.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Você não tem permissão para editar este curso" },
        { status: 403 }
      );
    }

    const body = await req.json();
    console.log("[COURSE_PATCH] Dados recebidos:", JSON.stringify(body, null, 2));

    const {
      title,
      description,
      imageUrl,
      price,
      promotionalPrice,
      categoryId,
      isPublished,
      metaTitle,
      metaDescription,
      learningPoints,
      duration,
      hasCertificate,
    } = body;

    // Preparar os dados para atualização
    const updateData: Record<string, unknown> = {};

    // Atualizar o slug apenas se o título for alterado
    if (title !== undefined && title !== existingCourse.title) {
      updateData.title = title;
      updateData.slug = await generateUniqueSlug(title, id);
    }

    // Atualizar outros campos se fornecidos
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (price !== undefined) updateData.price = price !== null ? parseFloat(String(price)) : null;
    if (promotionalPrice !== undefined) updateData.promotionalPrice = promotionalPrice !== null ? parseFloat(String(promotionalPrice)) : null;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (learningPoints !== undefined) updateData.learningPoints = learningPoints;
    if (duration !== undefined) updateData.duration = parseInt(String(duration));
    if (hasCertificate !== undefined) updateData.hasCertificate = hasCertificate;

    console.log("[COURSE_PATCH] Dados para atualização:", JSON.stringify(updateData, null, 2));

    // Atualizar o curso
    const updatedCourse = await prisma.course.update({
      where: {
        id,
      },
      data: updateData,
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    if (error instanceof Error) {
      console.error("[COURSE_PATCH]", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Excluir um curso
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await Promise.resolve(params);

    if (!id) {
      return NextResponse.json(
        { error: "ID do curso é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o curso existe
    const existingCourse = await prisma.course.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    // Obter o primeiro usuário do banco de dados (solução temporária)
    const firstUser = await prisma.user.findFirst({
      where: {
        OR: [
          { role: "ADMIN" },
          { role: "TEACHER" }
        ]
      }
    });

    // Verificar se o usuário é o professor do curso ou um administrador
    if (
      existingCourse.teacherId !== firstUser?.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Você não tem permissão para excluir este curso" },
        { status: 403 }
      );
    }

    // Verificar se o curso tem matrículas
    if (existingCourse._count.enrollments > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir um curso com alunos matriculados" },
        { status: 400 }
      );
    }

    // Excluir o curso
    await prisma.course.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COURSE_DELETE]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 