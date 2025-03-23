import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyNewPost } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, excerpt, slug } = body;

    if (!title || !excerpt || !slug) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    const result = await notifyNewPost({ title, excerpt, slug });

    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao enviar mensagem para o Telegram:", error);
    return NextResponse.json(
      { error: "Erro ao enviar mensagem para o Telegram" },
      { status: 500 }
    );
  }
} 