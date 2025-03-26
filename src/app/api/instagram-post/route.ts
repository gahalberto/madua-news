import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { imageUrl, caption } = await request.json();
    
    // Verificação básica dos dados recebidos
    if (!imageUrl || !caption) {
      return NextResponse.json(
        { error: 'URL da imagem e legenda são obrigatórios' },
        { status: 400 }
      );
    }

    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const instagramUserId = process.env.INSTAGRAM_USER_ID;

    if (!accessToken || !instagramUserId) {
      return NextResponse.json(
        { error: 'Configuração da API do Instagram não encontrada' },
        { status: 500 }
      );
    }

    // Passo 1: Criar o media object
    const mediaResponse = await fetch(
      `https://graph.instagram.com/v20.0/${instagramUserId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: accessToken,
        }),
      }
    );

    const mediaData = await mediaResponse.json();

    if (!mediaData.id) {
      return NextResponse.json(
        { error: 'Erro ao criar media object no Instagram', details: mediaData },
        { status: 500 }
      );
    }

    // Passo 2: Publicar o media object
    const publishResponse = await fetch(
      `https://graph.instagram.com/v20.0/${instagramUserId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: mediaData.id,
          access_token: accessToken,
        }),
      }
    );

    const result = await publishResponse.json();

    if (!result.id) {
      return NextResponse.json(
        { error: 'Erro ao publicar no Instagram', details: result },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Erro ao postar no Instagram:', error);
    return NextResponse.json(
      { error: 'Erro ao postar no Instagram', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
} 