import { generatePostBanner } from './imageGenerator';

/**
 * Gera um banner para o post a partir da imagem e título
 */
export async function generatePostBannerAndGetUrl(imageUrl: string, title: string): Promise<string | null> {
  try {
    const bannerUrl = await generatePostBanner({
      imageUrl,
      title,
    });
    
    return bannerUrl;
  } catch (error) {
    console.error('Erro ao gerar banner do post:', error);
    return null;
  }
} 