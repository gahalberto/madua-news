#!/bin/bash

echo "=== Iniciando Web Scraper Ynet News ==="
echo ""

# Verifica se o Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "ERRO: Python 3 não foi encontrado."
    echo "Por favor, instale o Python 3 para continuar."
    exit 1
fi

# Verifica se as bibliotecas necessárias estão instaladas a nível de sistema
echo "Verificando dependências Python..."
if ! python3 -c "import requests" 2>/dev/null; then
    echo "AVISO: A biblioteca 'requests' não está instalada."
    echo "Por favor, instale usando: apt install python3-requests"
    exit 1
fi

if ! python3 -c "from bs4 import BeautifulSoup" 2>/dev/null; then
    echo "AVISO: A biblioteca 'beautifulsoup4' não está instalada."
    echo "Por favor, instale usando: apt install python3-bs4"
    exit 1
fi

echo "Todas as dependências estão instaladas."
echo ""

# Define o número de artigos a serem extraídos
DEFAULT_LIMIT=10
read -p "Quantos artigos deseja extrair? (padrão: $DEFAULT_LIMIT): " LIMIT
LIMIT=${LIMIT:-$DEFAULT_LIMIT}

# Define o nome do arquivo de saída
DEFAULT_OUTPUT="ynetnews_articles.json"
read -p "Nome do arquivo de saída (padrão: $DEFAULT_OUTPUT): " OUTPUT
OUTPUT=${OUTPUT:-$DEFAULT_OUTPUT}

echo ""
echo "Iniciando extração de $LIMIT artigos..."
echo "Os resultados serão salvos em: $OUTPUT"
echo ""

# Executa o script Python diretamente com os parâmetros
python3 - <<EOF
import sys
sys.path.append('.')
from ynetnews_scraper import YnetNewsScraper

scraper = YnetNewsScraper()
articles = scraper.scrape_articles(limit=$LIMIT)
scraper.save_to_json("$OUTPUT")

print("\nResumo:")
print(f"Total de artigos extraídos: {len(articles)}")
for i, article in enumerate(articles, 1):
    print(f"{i}. {article['title']}")
EOF

echo ""
echo "=== Extração concluída ===" 