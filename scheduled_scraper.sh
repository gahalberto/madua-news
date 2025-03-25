#!/bin/bash

# Script para executar automaticamente o scraper e processar os artigos
# Criado para ser executado via cron

# Defina o diretório do projeto (ajustar conforme necessário)
PROJECT_DIR="$(dirname "$(realpath "$0")")"
cd "$PROJECT_DIR"

# Configurar log com data e hora
LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="$LOG_DIR/scraper_$TIMESTAMP.log"

# Iniciar log
echo "===== Iniciando execução automática do scraper em $(date) =====" | tee -a "$LOG_FILE"

# Número de artigos a serem extraídos
ARTICLES_LIMIT=10
OUTPUT_FILE="ynetnews_articles_$TIMESTAMP.json"

echo "Extraindo $ARTICLES_LIMIT artigos para o arquivo $OUTPUT_FILE" | tee -a "$LOG_FILE"

# Executar o scraper sem interação (modo automático)
./scraper.sh <<EOF | tee -a "$LOG_FILE"
$ARTICLES_LIMIT
$OUTPUT_FILE
EOF

# Verificar se o arquivo JSON foi criado
if [ ! -f "$OUTPUT_FILE" ]; then
    echo "ERRO: Arquivo de saída $OUTPUT_FILE não foi criado. Abortando." | tee -a "$LOG_FILE"
    exit 1
fi

# Importar os artigos para o banco de dados
echo "Importando artigos para o banco de dados..." | tee -a "$LOG_FILE"
npx ts-node import_articles.ts "$OUTPUT_FILE" 2>&1 | tee -a "$LOG_FILE"

# Processar os artigos (tradução e publicação)
echo "Processando e publicando artigos..." | tee -a "$LOG_FILE"
npx ts-node process_all_articles.ts 2>&1 | tee -a "$LOG_FILE"

# Finalizar log
echo "===== Execução do scraper concluída em $(date) =====" | tee -a "$LOG_FILE"

# Opcional: mover o arquivo JSON para uma pasta de arquivos processados
PROCESSED_DIR="$PROJECT_DIR/processed_files"
mkdir -p "$PROCESSED_DIR"
mv "$OUTPUT_FILE" "$PROCESSED_DIR/"

echo "Arquivo JSON movido para $PROCESSED_DIR/$OUTPUT_FILE" | tee -a "$LOG_FILE"

# Saída final
echo "Script executado com sucesso. Log salvo em: $LOG_FILE" 