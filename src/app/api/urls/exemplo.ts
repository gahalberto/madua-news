/**
 * Exemplo de como usar a API de URLs em aplicações cliente
 */

// Interface para tipar a resposta da API
interface ApiResponse {
  cursos: string[];
  ebooks: string[];
  produtos: string[];
  posts: string[];
}

// Usando JavaScript/TypeScript em um cliente
async function obterTodasAsURLs(): Promise<ApiResponse | null> {
  try {
    const resposta = await fetch('https://madua.com.br/api/urls');
    
    if (!resposta.ok) {
      throw new Error('Falha ao obter URLs');
    }
    
    const dados = await resposta.json() as ApiResponse;
    
    // Exemplo: utilizando as URLs para alguma finalidade
    console.log(`Total de cursos: ${dados.cursos.length}`);
    console.log(`Total de ebooks: ${dados.ebooks.length}`);
    console.log(`Total de produtos: ${dados.produtos.length}`);
    console.log(`Total de posts: ${dados.posts.length}`);
    
    // Exemplo: enviando URLs para indexação em mecanismos de busca
    enviarParaIndexacao(dados.posts);
    
    return dados;
  } catch (erro) {
    console.error('Erro ao obter URLs:', erro);
    return null;
  }
}

// Função de exemplo para envio de URLs para indexação
function enviarParaIndexacao(urls: string[]): void {
  console.log(`Enviando ${urls.length} URLs para indexação...`);
  // Implementação real dependeria do serviço de indexação
}

// Exemplo de uso com Node.js usando axios (necessário instalar)
// const axios = require('axios');
// 
// async function obterURLsComAxios(): Promise<ApiResponse | null> {
//   try {
//     const resposta = await axios.get('https://madua.com.br/api/urls');
//     return resposta.data as ApiResponse;
//   } catch (erro) {
//     console.error('Erro ao obter URLs com axios:', erro);
//     return null;
//   }
// } 