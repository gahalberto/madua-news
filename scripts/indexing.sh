#!/bin/bash

# Script para executar a indexação do Google
# Este script pode ser chamado diretamente pelo crontab

# Navegar para o diretório raiz do projeto
cd "$(dirname "$0")/.."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "ERRO: Não foi possível localizar o arquivo package.json. Verifique o caminho."
    exit 1
fi

echo "=== Iniciando Robô de Indexação do Google ==="
echo "Data e hora: $(date)"

# Carregar variáveis de ambiente, se existirem
if [ -f ".env" ]; then
    echo "Carregando variáveis de ambiente do arquivo .env"
    export $(grep -v '^#' .env | xargs)
else
    echo "AVISO: Arquivo .env não encontrado."
fi

# Verificar se as credenciais do Google estão configuradas
if [ -z "$GOOGLE_INDEXING_CLIENT_EMAIL" ] || [ -z "$GOOGLE_INDEXING_PRIVATE_KEY" ]; then
    echo "ERRO: Credenciais do Google não encontradas!"
    echo "Por favor, configure GOOGLE_INDEXING_CLIENT_EMAIL e GOOGLE_INDEXING_PRIVATE_KEY no arquivo .env"
    exit 1
fi

# Verificar se a URL do site está configurada
if [ -z "$NEXT_PUBLIC_SITE_URL" ]; then
    echo "AVISO: NEXT_PUBLIC_SITE_URL não está configurado. Usando URL padrão."
fi

# Executar o script TypeScript
echo "Executando script de indexação..."
npx ts-node src/scripts/indexing-cron.ts

# Verificar o resultado da execução
if [ $? -eq 0 ]; then
    echo "Script executado com sucesso!"
else
    echo "ERRO: O script de indexação terminou com falha."
    exit 1
fi

echo "=== Processo de indexação concluído ==="
echo "Data e hora de término: $(date)" 