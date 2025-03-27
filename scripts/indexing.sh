#!/bin/bash
export NODE_OPTIONS=--openssl-legacy-provider

# Script para executar a indexação do Google
# Este script pode ser chamado diretamente pelo crontab
set -a
source .env
set +a

export GOOGLE_INDEXING_PRIVATE_KEY=$(echo "$GOOGLE_INDEXING_PRIVATE_KEY" | sed 's/PRIVATE KEY-----/PRIVATE KEY-----\n/g' | sed 's/-----END/\n-----END/g')
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
    # Método mais seguro para carregar variáveis com caracteres especiais
    while IFS='=' read -r key value || [[ -n "$key" ]]; do
        # Ignorar linhas de comentário
        [[ $key == \#* ]] && continue
        # Ignorar linhas vazias
        [[ -z "$key" ]] && continue
        # Exportar a variável
        export "$key"="$value"
    done < .env
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

# Verificar se temos permissão para executar o script de correção de módulos
chmod +x scripts/fix-module-path.js

# Corrigir os caminhos de módulos no arquivo de indexação
echo "Pré-processando arquivo de script para resolver os aliases de importação..."
node scripts/fix-module-path.js src/lib/googleIndexing.ts
node scripts/fix-module-path.js src/scripts/indexing-cron.ts
node scripts/fix-module-path.js src/app/api/indexing/route.ts

# Executar o script TypeScript
echo "Executando script de indexação..."
npx ts-node --project tsconfig.json.cron src/scripts/indexing-cron.ts

# Verificar o resultado da execução
if [ $? -eq 0 ]; then
    echo "Script executado com sucesso!"
else
    echo "ERRO: O script de indexação terminou com falha."
    exit 1
fi

echo "=== Processo de indexação concluído ==="
echo "Data e hora de término: $(date)" 
