#!/bin/bash

# Script para executar os scripts TypeScript com npx ts-node

# Verifica se o arquivo existe
if [ ! -f "$1" ]; then
    echo "Erro: Arquivo $1 não encontrado."
    exit 1
fi

# Verifica se o npx está instalado
if ! command -v npx &> /dev/null; then
    echo "Erro: npx não está instalado. Instalando..."
    npm install -g npx
fi

# Verifica se o ts-node está instalado localmente
if [ ! -d "./node_modules/ts-node" ]; then
    echo "ts-node não encontrado localmente. Instalando..."
    npm install --save-dev ts-node typescript @types/node
fi

echo "Executando $1 com ts-node..."
# Executa o arquivo com npx ts-node
npx ts-node "$1" "$2" 