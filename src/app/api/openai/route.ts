import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt é obrigatório" }, { status: 400 });
    }

    const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: 'sk-712e38c4b9e3444793dd727ece47f17a'
    });


    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "Você é um assistente especializado em tradução e adaptação de artigos de notícias para o português brasileiro. Responda sempre em português." },
            { role: "user", content: prompt }
        ],
        model: "deepseek-chat",
    });

    return NextResponse.json(completion);
  } catch (error) {
    console.error("Erro na API DeepSeek:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
