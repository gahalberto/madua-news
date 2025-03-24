#!/bin/bash

# Script para garantir que as pastas de imagens existam e tenham permissões corretas
# Executar como root ou com sudo: sudo bash scripts/ensure-image-folders.sh

# Define o diretório base do projeto
BASE_DIR="/var/www/madua"
WEB_USER="www-data"
WEB_GROUP="www-data"

# Lista de pastas que precisam existir
IMAGE_FOLDERS=(
  "public/article-images"
  "public/blog-images"
  "public/covers"
  "public/uploads"
  "public/banners"
  "public/static"
)

echo "=== Verificando pastas de imagens ==="

# Verifica se o diretório base existe
if [ ! -d "$BASE_DIR" ]; then
  echo "Erro: Diretório base $BASE_DIR não encontrado."
  exit 1
fi

# Cria as pastas de imagens se não existirem
for folder in "${IMAGE_FOLDERS[@]}"; do
  FULL_PATH="$BASE_DIR/$folder"
  
  if [ ! -d "$FULL_PATH" ]; then
    echo "Criando pasta: $FULL_PATH"
    mkdir -p "$FULL_PATH"
  else
    echo "Pasta já existe: $FULL_PATH"
  fi
  
  # Ajusta permissões
  echo "Ajustando permissões para $FULL_PATH"
  chown -R $WEB_USER:$WEB_GROUP "$FULL_PATH"
  chmod -R 755 "$FULL_PATH"
done

echo "=== Verificação completa ==="
ls -la "$BASE_DIR/public"

echo ""
echo "Todas as pastas de imagens estão prontas e com permissões corretas."
echo "Usuário e grupo: $WEB_USER:$WEB_GROUP"
echo "Permissões: 755 (rwxr-xr-x)" 