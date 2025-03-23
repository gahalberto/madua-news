import { TwitterApi } from 'twitter-api-v2';
import { generatePostBanner } from './imageGenerator';
import fs from 'fs/promises';

// Configuração do cliente do Twitter
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY || '',
  appSecret: process.env.TWITTER_API_SECRET || '',
  accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
  accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
});

// Função para postar um tweet
export async function postTweet(content: string) {
  try {
    const tweet = await client.v2.tweet(content);
    console.log('Tweet postado com sucesso:', tweet);
    return tweet;
  } catch (error) {
    console.error('Erro ao postar tweet:', error);
    throw error;
  }
}

// Função para postar um tweet com imagem
export async function postTweetWithImage(content: string, imageUrl: string) {
  try {
    // Gerar o banner
    const bannerPath = await generatePostBanner({
      imageUrl,
      title: content,
    });

    // Caminho completo do arquivo
    const fullPath = process.cwd() + '/public' + bannerPath;

    // Ler o arquivo da imagem
    const imageBuffer = await fs.readFile(fullPath);

    // Fazer upload da mídia
    const mediaId = await client.v1.uploadMedia(imageBuffer, { mimeType: 'image/png' });

    // Postar o tweet com a mídia
    const tweet = await client.v2.tweet({
      text: content,
      media: { media_ids: [mediaId] }
    });

    // Limpar o arquivo temporário
    await fs.unlink(fullPath);

    console.log('Tweet com imagem postado com sucesso:', tweet);
    return tweet;
  } catch (error) {
    console.error('Erro ao postar tweet com imagem:', error);
    throw error;
  }
}

// Função para verificar se as credenciais estão configuradas
export function checkTwitterCredentials() {
  const requiredEnvVars = [
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'TWITTER_ACCESS_TOKEN',
    'TWITTER_ACCESS_SECRET',
  ];

  const missingVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Credenciais do Twitter não configuradas: ${missingVars.join(', ')}`
    );
  }
} 