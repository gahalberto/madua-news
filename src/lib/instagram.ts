/**
 * Módulo para integração com a API do Instagram
 * 
 * Este módulo contém funções para automatizar a postagem de conteúdo no Instagram
 * após a criação de novos posts no blog.
 */

/**
 * Envia um post para o Instagram automaticamente após sua criação
 * usando o banner para redes sociais como imagem.
 */
export async function postToInstagram(post: {
  id: string;
  title: string;
  excerpt?: string | null;
  slug?: string | null;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    console.log(`Iniciando processo de postagem no Instagram para o post ${post.id}`);
    
    if (!post.title) {
      throw new Error('Título do post é obrigatório para postagem no Instagram');
    }

    // Preparar a legenda para o Instagram
    const caption = `${post.title}\n\n${post.excerpt || ''}\n\nNotícia completa no nosso site, link na bio!`;
    
    // Gerar banner para o post
    console.log('Gerando banner para o Instagram...');
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madua.com.br';
    
    // Gera o banner utilizando a API interna
    const generateResponse = await fetch(`${baseUrl}/api/generate-banner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: post.title,
        imageUrl: `/images/default-post-image.jpg` // Usa imagem padrão como fallback
      }),
      next: { revalidate: 0 } // Evita cache
    });
    
    if (!generateResponse.ok) {
      const errorData = await generateResponse.json();
      throw new Error(`Erro ao gerar banner: ${errorData.error || 'Erro desconhecido'}`);
    }
    
    const { bannerUrl } = await generateResponse.json();
    
    if (!bannerUrl) {
      throw new Error('URL do banner não foi retornada');
    }
    
    // Construir URL completa para o banner
    let fullBannerUrl = `${baseUrl}${bannerUrl.startsWith('/') ? '' : '/'}${bannerUrl}`;
    console.log(`Banner gerado: ${fullBannerUrl}`);
    
    // Primeiro, testar se a URL é acessível
    console.log("Testando acessibilidade da URL do banner...");
    const testResponse = await fetch(`${baseUrl}/api/test-image-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: fullBannerUrl }),
      next: { revalidate: 0 } // Evita cache
    });
    
    const testResult = await testResponse.json();
    
    if (!testResult.isAccessible) {
      let errorMessage = 'A URL do banner não é acessível publicamente.';
      console.error("Teste de URL falhou:", testResult);
      
      // Se a URL não estiver acessível, vamos usar a imagem padrão diretamente
      console.log("Tentando usar imagem padrão em vez do banner gerado...");
      const defaultImageUrl = `${baseUrl}/images/default-post-image.jpg`;
      
      // Teste a imagem padrão
      const defaultImageTest = await fetch(`${baseUrl}/api/test-image-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: defaultImageUrl }),
        next: { revalidate: 0 }
      });
      
      const defaultImageResult = await defaultImageTest.json();
      
      if (!defaultImageResult.isAccessible) {
        throw new Error(`Nem o banner nem a imagem padrão estão acessíveis. Impossível postar no Instagram.`);
      }
      
      // Usar a imagem padrão
      console.log("Usando imagem padrão para postagem no Instagram");
      fullBannerUrl = defaultImageUrl;
    }
    
    // Enviar para o Instagram
    console.log("Enviando post para o Instagram...");
    const response = await fetch(`${baseUrl}/api/instagram-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: fullBannerUrl,
        caption,
      }),
      next: { revalidate: 0 } // Evita cache
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      let errorMessage = 'Erro ao enviar para o Instagram';
      
      if (responseData.error) {
        errorMessage = responseData.error;
      }
      
      console.error('Detalhes do erro Instagram:', responseData);
      throw new Error(errorMessage);
    }

    console.log("Post enviado com sucesso para o Instagram:", responseData);
    return { 
      success: true, 
      id: responseData.id 
    };
  } catch (error) {
    console.error('Erro ao postar no Instagram:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar para o Instagram' 
    };
  }
} 