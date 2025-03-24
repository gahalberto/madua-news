#!/bin/bash

# Script para instalar o pacote critters em ambiente de produção
echo "Instalando critters para otimização de CSS..."

# Mudar para o diretório do projeto
cd /var/www/madua

# Instalar critters com --no-save para não modificar o package.json
npm install critters --no-save

# Verificar se a instalação foi bem-sucedida
if [ $? -eq 0 ]; then
  echo "✅ critters instalado com sucesso!"
  echo "Agora tente executar 'npm run build' novamente."
else
  echo "❌ Falha ao instalar critters."
  echo "Tente executar manualmente: npm install critters --no-save"
fi 