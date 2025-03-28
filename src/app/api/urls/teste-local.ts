/**
 * Script para testar a API de URLs localmente
 * 
 * Para executar este teste:
 * 1. Certifique-se de que seu servidor Next.js esteja rodando em desenvolvimento
 * 2. Execute este script com: npx ts-node src/app/api/urls/teste-local.ts
 */

import fetch from 'node-fetch';

// Interface para tipar a resposta da API
interface ApiResponse {
  cursos: string[];
  ebooks: string[];
  produtos: string[];
  posts: string[];
}

async function testarAPI() {
  try {
    // URL da API em ambiente de desenvolvimento
    const url = 'http://localhost:3000/api/urls';
    
    console.log(`Testando API de URLs em: ${url}`);
    
    const resposta = await fetch(url);
    
    if (!resposta.ok) {
      throw new Error(`Erro na resposta: ${resposta.status} ${resposta.statusText}`);
    }
    
    const dados = await resposta.json() as ApiResponse;
    
    console.log('===== Resultado do teste da API de URLs =====');
    console.log(`Total de cursos: ${dados.cursos.length}`);
    console.log(`Total de ebooks: ${dados.ebooks.length}`);
    console.log(`Total de produtos: ${dados.produtos.length}`);
    console.log(`Total de posts: ${dados.posts.length}`);
    
    // Mostrar alguns exemplos de cada categoria (se existirem)
    if (dados.cursos.length > 0) {
      console.log('\nExemplos de URLs de cursos:');
      dados.cursos.slice(0, 3).forEach((url: string) => console.log(`  - ${url}`));
    }
    
    if (dados.ebooks.length > 0) {
      console.log('\nExemplos de URLs de ebooks:');
      dados.ebooks.slice(0, 3).forEach((url: string) => console.log(`  - ${url}`));
    }
    
    if (dados.produtos.length > 0) {
      console.log('\nExemplos de URLs de produtos:');
      dados.produtos.slice(0, 3).forEach((url: string) => console.log(`  - ${url}`));
    }
    
    if (dados.posts.length > 0) {
      console.log('\nExemplos de URLs de posts:');
      dados.posts.slice(0, 3).forEach((url: string) => console.log(`  - ${url}`));
    }
    
    console.log('\n===== Teste concluído com sucesso =====');
  } catch (erro) {
    console.error('Erro durante o teste da API:', erro);
  }
}

// Executar o teste
testarAPI(); 