#!/bin/bash

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
  echo "Por favor, execute como root"
  exit 1
fi

# Instalar dependências do sistema se necessário
apt-get update
apt-get install -y python3-full python3-pip python3-venv

# Criar ambiente virtual
python3 -m venv venv

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
pip install selenium beautifulsoup4 requests

# Dar permissão de execução ao script do scraper
chmod +x scraper_auto.sh

# Configurar permissões
chown -R www-data:www-data venv/
chown -R www-data:www-data scraper_auto.sh

echo "Ambiente virtual configurado com sucesso!" 