#!/bin/bash

# Criar ambiente virtual
python3 -m venv venv

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
pip install selenium beautifulsoup4 requests

# Dar permissão de execução ao script do scraper
chmod +x scraper_auto.sh

echo "Ambiente virtual configurado com sucesso!" 