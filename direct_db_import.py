#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import argparse
import subprocess
import os
import sys
import tempfile
from typing import List, Dict, Any

def ler_arquivo_json(caminho_arquivo: str) -> List[Dict[str, Any]]:
    """Lê um arquivo JSON e retorna seu conteúdo."""
    try:
        print(f"Lendo arquivo: {caminho_arquivo}")
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo:
            dados = json.load(arquivo)
        print(f"Encontrados {len(dados)} artigos no arquivo JSON.")
        return dados
    except Exception as e:
        print(f"Erro ao ler o arquivo JSON: {e}")
        return []

def inserir_no_banco(artigos: List[Dict[str, Any]]) -> bool:
    """Insere artigos diretamente no banco de dados usando Prisma CLI."""
    try:
        # Criar um arquivo temporário com os comandos Prisma
        with tempfile.NamedTemporaryFile(suffix='.ts', delete=False, mode='w') as temp:
            temp_filename = temp.name
            
            # Escrever o código para inserir os artigos
            temp.write("""
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const artigos = ${ARTIGOS_JSON};
  
  console.log(`Inserindo ${artigos.length} artigos no banco de dados...`);
  
  for (const artigo of artigos) {
    try {
      const saved = await prisma.scrapedArticle.create({
        data: {
          sourceUrl: artigo.url,
          title: artigo.title,
          description: artigo.description,
          content: artigo.content,
          status: 'PENDING',
          source: 'YNET_NEWS',
        }
      });
      
      console.log(`Artigo inserido com ID: ${saved.id}`);
    } catch (error) {
      console.error(`Erro ao inserir artigo "${artigo.title}":`, error);
    }
  }
  
  console.log('Operação concluída!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
""".replace("${ARTIGOS_JSON}", json.dumps(artigos)))
        
        # Executar o script usando o npx ts-node
        print("Executando script de inserção no banco de dados...")
        result = subprocess.run(
            ["npx", "ts-node", temp_filename],
            capture_output=True,
            text=True,
            check=False
        )
        
        # Exibir a saída
        if result.stdout:
            print("Saída:")
            print(result.stdout)
            
        if result.stderr:
            print("Erros:")
            print(result.stderr)
            
        # Remover o arquivo temporário
        os.unlink(temp_filename)
        
        return result.returncode == 0
    
    except Exception as e:
        print(f"Erro ao inserir dados no banco: {e}")
        return False

def main():
    """Função principal."""
    parser = argparse.ArgumentParser(description='Importa dados extraídos diretamente para o banco de dados.')
    parser.add_argument('--file', type=str, required=True, help='Caminho para o arquivo JSON com os dados extraídos')
    
    args = parser.parse_args()
    
    # Lê os dados do arquivo
    dados = ler_arquivo_json(args.file)
    
    if not dados:
        print("Nenhum dado encontrado para importar.")
        return
    
    # Insere os dados diretamente no banco
    sucesso = inserir_no_banco(dados)
    
    if sucesso:
        print("Operação concluída com sucesso!")
    else:
        print("A operação falhou. Verifique os erros acima.")
        sys.exit(1)

if __name__ == "__main__":
    main() 