import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["pending", "read", "replied"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = updateSchema.parse(body);

    const contact = await prisma.contact.update({
      where: {
        id: params.id,
      },
      data: {
        status: validatedData.status,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar contato:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar mensagem" },
      { status: 500 }
    );
  }
}

