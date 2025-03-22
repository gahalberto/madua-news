import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema de validação
const newsletterSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validar o e-mail
    const { email } = newsletterSchema.parse(body);
    
    // Verificar se o e-mail já está cadastrado
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });
    
    if (existingSubscriber) {
      if (!existingSubscriber.active) {
        // Reativar inscrição
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { active: true },
        });
        
        return NextResponse.json({
          message: "Inscrição reativada com sucesso!",
        });
      }
      
      return NextResponse.json(
        { error: "E-mail já está inscrito na newsletter." },
        { status: 400 }
      );
    }
    
    // Criar nova inscrição
    await prisma.newsletterSubscriber.create({
      data: { email },
    });
    
    return NextResponse.json({
      message: "Inscrição realizada com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao processar inscrição:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "E-mail inválido." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Erro ao processar inscrição." },
      { status: 500 }
    );
  }
} 