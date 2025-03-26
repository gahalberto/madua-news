import { NextResponse } from 'next/server';

// Função para verificar se uma URL é acessível
async function isUrlAccessible(url: string): Promise<boolean> {
  try {
    // Tentar acessar a URL com um HEAD request
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        // Alguns servidores bloqueiam requisições sem User-Agent
        'User-Agent': 'Mozilla/5.0 Instagram URL Validator'
      }
    });
    
    // Verificar se o status é OK e se o tipo de conteúdo é uma imagem
    const contentType = response.headers.get('content-type') || '';
    const isImage = contentType.startsWith('image/');
    
    return response.ok && isImage;
  } catch (error) {
    console.error('Erro ao verificar URL:', error);
    return false;
  }
}

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

    // Verificar se a URL da imagem é acessível
    const isAccessible = await isUrlAccessible(imageUrl);
    if (!isAccessible) {
      return NextResponse.json(
        { 
          error: 'URL da imagem não acessível',
          details: 'A URL da imagem não é acessível publicamente ou não é uma imagem válida. O Instagram requer URLs públicas acessíveis pela internet.'
        },
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

    console.log('Enviando requisição para Instagram API', { 
      userId: instagramUserId,
      imageUrl: imageUrl.substring(0, 50) + '...',
      captionLength: caption.length
    });

    // Passo 1: Criar o media object (container)
    const mediaUrl = `https://graph.facebook.com/v22.0/${instagramUserId}/media`;
    console.log(`Fazendo solicitação para: ${mediaUrl}`);
    
    const mediaParams = new URLSearchParams({
      image_url: imageUrl,
      caption: caption,
      access_token: accessToken
    });

    const mediaResponse = await fetch(
      `${mediaUrl}?${mediaParams.toString()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    // Verificar se a resposta não está no formato JSON
    const contentType = mediaResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await mediaResponse.text();
      console.error('Resposta não-JSON da API do Instagram:', textResponse.substring(0, 200));
      return NextResponse.json(
        { 
          error: 'Resposta inválida da API do Instagram', 
          details: textResponse.substring(0, 200)
        },
        { status: 500 }
      );
    }

    const mediaData = await mediaResponse.json();
    console.log('Resposta do Instagram (media):', mediaData);

    if (!mediaData.id) {
      return NextResponse.json(
        { error: 'Erro ao criar media object no Instagram', details: mediaData },
        { status: 500 }
      );
    }

    // Passo 2: Publicar o media object com o ID do container
    const publishUrl = `https://graph.facebook.com/v22.0/${instagramUserId}/media_publish`;
    console.log(`Fazendo solicitação para: ${publishUrl}`);
    
    const publishParams = new URLSearchParams({
      creation_id: mediaData.id,
      access_token: accessToken
    });

    const publishResponse = await fetch(
      `${publishUrl}?${publishParams.toString()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    // Verificar se a resposta não está no formato JSON
    const publishContentType = publishResponse.headers.get('content-type');
    if (!publishContentType || !publishContentType.includes('application/json')) {
      const textResponse = await publishResponse.text();
      console.error('Resposta não-JSON da API do Instagram (publish):', textResponse.substring(0, 200));
      return NextResponse.json(
        { 
          error: 'Resposta inválida da API do Instagram ao publicar', 
          details: textResponse.substring(0, 200)
        },
        { status: 500 }
      );
    }

    const result = await publishResponse.json();
    console.log('Resposta do Instagram (publish):', result);

    if (!result.id) {
      return NextResponse.json(
        { error: 'Erro ao publicar no Instagram', details: result },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      id: result.id,
      mediaId: mediaData.id 
    });
  } catch (error) {
    console.error('Erro ao postar no Instagram:', error);
    return NextResponse.json(
      { error: 'Erro ao postar no Instagram', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
} 