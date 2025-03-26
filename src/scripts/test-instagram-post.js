/**
 * Script de teste para enviar um post para o Instagram
 * 
 * Este script pode ser usado para testar a funcionalidade de postagem no Instagram
 * sem a necessidade de criar um novo post pelo scraper.
 * 
 * Uso: node src/scripts/test-instagram-post.js
 */

// Importar o PrismaClient e fetch
const { PrismaClient } = require('@prisma/client');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const prisma = new PrismaClient();

// Função para gerar um banner e enviar para o Instagram
async function sendPostToInstagram(postId) {
  try {
    console.log(`Testando postagem no Instagram para o post ID: ${postId}`);
    
    // Buscar o post no banco de dados
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      console.error(`Post com ID ${postId} não encontrado`);
      return;
    }
    
    console.log(`Post encontrado: ${post.title}`);
    
    // Preparar a legenda
    const caption = `${post.title}\n\n${post.excerpt || ''}\n\nNotícia completa no nosso site, link na bio!`;
    
    // URL base do site
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madua.com.br';
    
    // Gerar o banner
    console.log('Gerando banner...');
    const generateResponse = await fetch(`${baseUrl}/api/generate-banner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: post.title,
        imageUrl: post.imageUrl || '/images/default-post-image.jpg'
      })
    });
    
    if (!generateResponse.ok) {
      const errorData = await generateResponse.json();
      throw new Error(`Erro ao gerar banner: ${JSON.stringify(errorData)}`);
    }
    
    const { bannerUrl } = await generateResponse.json();
    
    if (!bannerUrl) {
      throw new Error('URL do banner não foi retornada');
    }
    
    // URL completa do banner
    const fullBannerUrl = `${baseUrl}${bannerUrl.startsWith('/') ? '' : '/'}${bannerUrl}`;
    console.log(`Banner gerado: ${fullBannerUrl}`);
    
    // Testar acessibilidade da URL
    console.log('Testando acessibilidade da URL...');
    const testResponse = await fetch(`${baseUrl}/api/test-image-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: fullBannerUrl })
    });
    
    const testResult = await testResponse.json();
    console.log('Resultado do teste de URL:', testResult);
    
    if (!testResult.isAccessible) {
      throw new Error(`URL do banner não é acessível: ${JSON.stringify(testResult)}`);
    }
    
    // Enviar para o Instagram
    console.log('Enviando para o Instagram...');
    const response = await fetch(`${baseUrl}/api/instagram-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: fullBannerUrl,
        caption
      })
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(`Erro ao publicar no Instagram: ${JSON.stringify(responseData)}`);
    }
    
    console.log('Post enviado com sucesso para o Instagram!');
    console.log('Resposta:', responseData);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Função principal
async function main() {
  // Você pode especificar um ID de post específico ou pegar o mais recente
  let postId = process.argv[2]; // Pegar da linha de comando se fornecido
  
  if (!postId) {
    // Se não foi fornecido um ID, pegar o post mais recente
    const latestPost = await prisma.post.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (latestPost) {
      postId = latestPost.id;
      console.log(`Usando o post mais recente: ${latestPost.title} (${postId})`);
    } else {
      console.error('Nenhum post encontrado no banco de dados');
      await prisma.$disconnect();
      return;
    }
  }
  
  await sendPostToInstagram(postId);
}

// Executar o script
main()
  .catch(console.error); 