import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Verificar se o usuário está autenticado
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Buscar os pedidos do usuário que foram pagos
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: "PAID"
      },
      include: {
        orderItems: {
          where: {
            productType: "COURSE"
          },
          include: {
            product: true
          }
        }
      }
    });

    // Extrair os cursos dos pedidos
    const courseItems = orders.flatMap(order => order.orderItems);
    
    // Criar um mapa para evitar duplicatas (caso o usuário tenha comprado o mesmo curso várias vezes)
    const courseMap = new Map();
    
    // Processar os itens de pedido para obter informações dos cursos
    for (const item of courseItems) {
      // Extrair o ID do curso do productId (formato: "course-{courseId}")
      const courseIdMatch = item.productId.match(/^course-(.+)$/);
      if (courseIdMatch && courseIdMatch[1] && !courseMap.has(courseIdMatch[1])) {
        // Buscar o curso no banco de dados
        const course = await prisma.course.findUnique({
          where: { id: courseIdMatch[1] },
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            category: {
              select: {
                id: true,
                name: true
              }
            },
            chapters: {
              where: { isPublished: true },
              orderBy: { position: "asc" },
              select: {
                id: true,
                title: true,
                position: true,
                isFree: true
              }
            }
          }
        });

        if (course) {
          courseMap.set(courseIdMatch[1], {
            id: course.id,
            title: item.title || course.title,
            description: course.description,
            imageUrl: course.imageUrl,
            teacher: course.teacher,
            category: course.category,
            chapters: course.chapters,
            purchaseDate: new Intl.DateTimeFormat('pt-BR').format(new Date(item.createdAt))
          });
        }
      }
    }
    
    // Converter o mapa para um array
    const userCourses = Array.from(courseMap.values());

    return NextResponse.json(userCourses);
  } catch (error) {
    console.error("Erro ao buscar cursos do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cursos" },
      { status: 500 }
    );
  }
} 