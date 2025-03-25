#!/bin/bash

# Script simplificado para execução do scraper
# Este script executa diretamente o Python sem usar ambiente virtual

# Diretório do projeto
PROJECT_DIR="$(dirname "$(realpath "$0")")"
cd "$PROJECT_DIR"

# Configuração de log
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="logs/scraper_$TIMESTAMP.log"
mkdir -p logs

# Arquivo de saída
OUTPUT_FILE="ynetnews_articles_$TIMESTAMP.json"

echo "===== Iniciando execução do scraper em $(date) =====" | tee -a "$LOG_FILE"

# Verificar dependências
if ! command -v python3 &> /dev/null; then
    echo "ERRO: Python 3 não encontrado" | tee -a "$LOG_FILE"
    exit 1
fi

# Executar diretamente o script Python
echo "Executando scraper para $OUTPUT_FILE..." | tee -a "$LOG_FILE"

python3 - <<EOF | tee -a "$LOG_FILE"
import sys
import os
try:
    import requests
except ImportError:
    print("ERRO: Módulo 'requests' não encontrado. Instale com: apt install python3-requests")
    sys.exit(1)

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("ERRO: Módulo 'beautifulsoup4' não encontrado. Instale com: apt install python3-bs4")
    sys.exit(1)

try:
    sys.path.append('.')
    from ynetnews_scraper import YnetNewsScraper
    
    # Executar o scraper
    scraper = YnetNewsScraper()
    articles = scraper.scrape_articles(limit=10)
    scraper.save_to_json("$OUTPUT_FILE")
    
    print("\nResumo:")
    print(f"Total de artigos extraídos: {len(articles)}")
    for i, article in enumerate(articles, 1):
        print(f"{i}. {article['title']}")
except Exception as e:
    print(f"ERRO: {e}")
    sys.exit(1)
EOF

# Verificar se o arquivo foi criado
if [ ! -f "$OUTPUT_FILE" ]; then
    echo "ERRO: Arquivo $OUTPUT_FILE não foi criado" | tee -a "$LOG_FILE"
    exit 1
fi

# Importar artigos para o banco
echo "Importando artigos para o banco de dados..." | tee -a "$LOG_FILE"
npx ts-node import_articles.ts "$OUTPUT_FILE" 2>&1 | tee -a "$LOG_FILE"

# Processar artigos
echo "Processando artigos..." | tee -a "$LOG_FILE"
npx ts-node process_all_articles.ts 2>&1 | tee -a "$LOG_FILE"

# Mover arquivo processado
mkdir -p processed_files
mv "$OUTPUT_FILE" "processed_files/"

echo "===== Scraper concluído em $(date) =====" | tee -a "$LOG_FILE" 