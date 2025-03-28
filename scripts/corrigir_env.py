#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script para verificar e corrigir o formato da chave privada no arquivo .env
Este script ajuda a garantir que a chave privada esteja formatada corretamente.
"""

import os
import re
import sys

def corrigir_env():
    """Corrige o formato da chave privada no arquivo .env"""
    # Verificar se o arquivo .env existe
    if not os.path.isfile('.env'):
        print("Arquivo .env não encontrado!")
        sys.exit(1)
    
    # Ler o conteúdo do arquivo .env
    with open('.env', 'r') as file:
        content = file.read()
    
    # Verificar se a variável GOOGLE_INDEXING_PRIVATE_KEY existe
    if 'GOOGLE_INDEXING_PRIVATE_KEY' not in content:
        print("Variável GOOGLE_INDEXING_PRIVATE_KEY não encontrada no arquivo .env!")
        sys.exit(1)
    
    # Extrair a chave privada
    private_key_match = re.search(r'GOOGLE_INDEXING_PRIVATE_KEY="(.*?)"', content, re.DOTALL)
    if not private_key_match:
        print("Erro ao extrair a chave privada. Verifique o formato no arquivo .env!")
        sys.exit(1)
    
    original_key = private_key_match.group(1)
    
    # Verificar se a chave já está no formato correto
    if "\\n" in original_key and original_key.startswith("-----BEGIN PRIVATE KEY-----\\n"):
        print("Chave privada já está no formato correto!")
        return
    
    # Corrigir o formato da chave
    corrected_key = original_key.replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\\n")
    corrected_key = corrected_key.replace("-----END PRIVATE KEY-----", "\\n-----END PRIVATE KEY-----")
    
    # Garantir que as quebras de linha internas sejam mantidas
    lines = corrected_key.split("\\n")
    corrected_lines = []
    
    for i, line in enumerate(lines):
        if line and not line.startswith("-----BEGIN") and not line.startswith("-----END"):
            # Garantir que linhas longas tenham comprimento de 64 caracteres
            if len(line) > 64:
                for j in range(0, len(line), 64):
                    corrected_lines.append(line[j:j+64])
            else:
                corrected_lines.append(line)
        else:
            corrected_lines.append(line)
    
    corrected_key = "\\n".join(corrected_lines)
    
    # Substituir a chave original pela corrigida no conteúdo do arquivo
    content = content.replace(original_key, corrected_key)
    
    # Fazer backup do arquivo original
    backup_file = '.env.bak'
    with open(backup_file, 'w') as file:
        file.write(content.replace(corrected_key, original_key))
    print(f"Backup do arquivo original criado em {backup_file}")
    
    # Salvar o arquivo corrigido
    with open('.env', 'w') as file:
        file.write(content)
    
    print("Arquivo .env corrigido com sucesso!")
    print("Formato da chave privada foi ajustado para garantir compatibilidade.")

if __name__ == "__main__":
    print("Verificando e corrigindo o arquivo .env...")
    corrigir_env() 