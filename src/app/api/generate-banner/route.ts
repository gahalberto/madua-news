import { NextResponse } from "next/server";
import { generatePostBanner } from "@/lib/imageGenerator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, imageUrl } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Título e URL da imagem são obrigatórios" },
        { status: 400 }
      );
    }

    const bannerUrl = await generatePostBanner({ title, imageUrl });

    return NextResponse.json({ bannerUrl });
  } catch (error) {
    console.error("Erro ao gerar banner:", error);
    return NextResponse.json(
      { error: "Erro ao gerar banner" },
      { status: 500 }
    );
  }
} 