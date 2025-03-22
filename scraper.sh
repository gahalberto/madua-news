#!/bin/bash

echo "=== Iniciando Web Scraper Ynet News ==="
echo ""

# Verifica se o Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "ERRO: Python 3 não foi encontrado."
    echo "Por favor, instale o Python 3 para continuar."
    exit 1
fi

# Verifica se o pacote venv está instalado
python3 -c "import venv" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "AVISO: O módulo 'venv' não está instalado."
    echo "Tentando instalar o pacote python3-venv..."
    sudo apt-get update && sudo apt-get install -y python3-venv python3-full
    if [ $? -ne 0 ]; then
        echo "ERRO: Não foi possível instalar o pacote 'python3-venv'."
        echo "Por favor, instale manualmente: sudo apt-get install python3-venv python3-full"
        exit 1
    fi
fi

# Cria um ambiente virtual se não existir
VENV_DIR=".venv"
if [ ! -d "$VENV_DIR" ]; then
    echo "Criando ambiente virtual Python..."
    python3 -m venv "$VENV_DIR"
    if [ $? -ne 0 ]; then
        echo "ERRO: Falha ao criar o ambiente virtual."
        exit 1
    fi
fi

# Ativa o ambiente virtual
source "$VENV_DIR/bin/activate"

# Verifica se as bibliotecas necessárias estão instaladas
echo "Verificando dependências no ambiente virtual..."
python -c "import requests" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Instalando biblioteca 'requests'..."
    pip install requests
    if [ $? -ne 0 ]; then
        echo "ERRO: Não foi possível instalar a biblioteca 'requests'."
        deactivate
        exit 1
    fi
fi

python -c "from bs4 import BeautifulSoup" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Instalando biblioteca 'beautifulsoup4'..."
    pip install beautifulsoup4
    if [ $? -ne 0 ]; then
        echo "ERRO: Não foi possível instalar a biblioteca 'beautifulsoup4'."
        deactivate
        exit 1
    fi
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
python - <<EOF
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

# Desativa o ambiente virtual
deactivate

echo ""
echo "=== Extração concluída ===" 