#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import requests
import argparse
import os
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

def enviar_para_api(dados: List[Dict[str, Any]], url_api: str = "http://localhost:3000/api/scraper") -> bool:
    """Envia dados para a API."""
    try:
        print(f"Enviando dados para a API: {url_api}")
        resposta = requests.post(url_api, json=dados)
        
        if resposta.status_code == 200:
            print("Dados enviados com sucesso!")
            print(f"Resposta: {resposta.json()}")
            return True
        else:
            print(f"ERRO: A API retornou código de status {resposta.status_code}")
            print(f"Resposta: {resposta.text}")
            return False
    except Exception as e:
        print(f"ERRO ao enviar dados para a API: {e}")
        return False

def main():
    """Função principal."""
    parser = argparse.ArgumentParser(description='Envia dados extraídos para a API.')
    parser.add_argument('--file', type=str, required=True, help='Caminho para o arquivo JSON com os dados extraídos')
    parser.add_argument('--api', type=str, default="http://localhost:3000/api/scraper", help='URL da API para enviar os dados')
    
    args = parser.parse_args()
    
    # Lê os dados do arquivo
    dados = ler_arquivo_json(args.file)
    
    if not dados:
        print("Nenhum dado encontrado para enviar.")
        return
    
    # Envia os dados para a API
    sucesso = enviar_para_api(dados, args.api)
    
    if sucesso:
        print("Operação concluída com sucesso!")
    else:
        print("A operação falhou. Verifique os erros acima.")

if __name__ == "__main__":
    main() 