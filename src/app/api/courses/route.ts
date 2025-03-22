import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import slugify from "slugify";

// Função para gerar slug único
async function generateUniqueSlug(title: string): Promise<string> {
  // Gerar slug base a partir do título
  const baseSlug = slugify(title, {
    lower: true,
    strict: true,
    locale: 'pt',
    remove: /[*+~.()'"!:@]/g
  });
  
  let slug = baseSlug;
  let counter = 1;
  
  // Verificar se o slug já existe
  while (true) {
    const existingCourse = await prisma.course.findUnique({
      where: { slug }
    });
    
    if (!existingCourse) break;
    
    // Se já existe, adicionar um número ao final
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

// GET /api/courses - Listar todos os cursos
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const teacherId = searchParams.get("teacherId");
    const published = searchParams.get("published");
    const slug = searchParams.get("slug");

    // Construir o filtro baseado nos parâmetros
    const filter: Prisma.CourseWhereInput = {};
    
    if (categoryId) {
      filter.categoryId = categoryId;
    }
    
    if (teacherId) {
      filter.teacherId = teacherId;
    }
    
    if (published) {
      filter.isPublished = published === "true";
    }
    
    if (slug) {
      filter.slug = slug;
    }

    const courses = await prisma.course.findMany({
      where: filter,
      include: {
        category: true,
        teacher: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            chapters: true,
            enrollments: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("[COURSES_GET]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// POST /api/courses - Criar um novo curso
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    console.log("[COURSES_POST] Sessão completa:", JSON.stringify(session, null, 2));

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
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

    console.log("[COURSES_POST] Usando ID do primeiro usuário:", firstUser.id);
    
    const body = await req.json();
    console.log("[COURSES_POST] Dados recebidos:", JSON.stringify(body, null, 2));
    
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

    if (!title) {
      return NextResponse.json(
        { error: "O título do curso é obrigatório" },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: "A descrição do curso é obrigatória" },
        { status: 400 }
      );
    }

    // Gerar slug único baseado no título
    const slug = await generateUniqueSlug(title);

    // Criar o curso usando o ID do primeiro usuário
    const courseData = {
      title,
      description,
      slug,
      imageUrl,
      price: price ? parseFloat(String(price)) : null,
      promotionalPrice: promotionalPrice ? parseFloat(String(promotionalPrice)) : null,
      isPublished: isPublished || false,
      categoryId: categoryId || null,
      teacherId: firstUser.id, // Usar o ID do primeiro usuário
      metaTitle: metaTitle || title, // Usar o título como metaTitle se não for fornecido
      metaDescription: metaDescription || description.substring(0, 160), // Usar os primeiros 160 caracteres da descrição como metaDescription se não for fornecido
      learningPoints: learningPoints || [],
      duration: duration !== undefined ? parseInt(String(duration)) : 0,
      hasCertificate: hasCertificate || false,
    };

    console.log("[COURSES_POST] Dados para criação:", JSON.stringify(courseData, null, 2));

    const course = await prisma.course.create({
      data: courseData,
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSES_POST]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// PUT /api/courses/update-slugs - Atualizar slugs de todos os cursos
export async function PUT() {
  try {
    const session = await getServerSession(authOptions);

    // Verificar se o usuário está autenticado e é administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado. Apenas administradores podem atualizar slugs." },
        { status: 401 }
      );
    }

    // Buscar todos os cursos sem slug
    const coursesWithoutSlug = await prisma.course.findMany({
      where: {
        OR: [
          { slug: null },
          { slug: "" }
        ]
      },
      select: {
        id: true,
        title: true,
      }
    });

    console.log(`Encontrados ${coursesWithoutSlug.length} cursos sem slug.`);

    // Atualizar cada curso com um slug único
    const updatedCourses = [];
    for (const course of coursesWithoutSlug) {
      const slug = await generateUniqueSlug(course.title);
      
      const updatedCourse = await prisma.course.update({
        where: { id: course.id },
        data: { slug },
      });
      
      updatedCourses.push({
        id: updatedCourse.id,
        title: updatedCourse.title,
        slug: updatedCourse.slug,
      });
      
      console.log(`Curso atualizado: ${course.title} -> ${slug}`);
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCourses.length} cursos atualizados com slugs.`,
      updatedCourses,
    });
  } catch (error) {
    console.error("[COURSES_UPDATE_SLUGS]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 