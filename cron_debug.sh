#!/bin/bash

# Script para verificar se o cron está sendo executado corretamente
# Útil para depuração

echo "[$(date)] Script de depuração do cron executado"
echo "Usuário: $(whoami)"
echo "Diretório atual: $(pwd)"
echo "Variáveis de ambiente:"
env | sort

# Verificar disponibilidade dos scripts
if [ -f "./scheduled_scraper.sh" ]; then
  echo "scheduled_scraper.sh existe e tem permissões: $(ls -la ./scheduled_scraper.sh)"
else
  echo "ERRO: scheduled_scraper.sh não encontrado!"
fi

if [ -f "./scraper.sh" ]; then
  echo "scraper.sh existe e tem permissões: $(ls -la ./scraper.sh)"
else
  echo "ERRO: scraper.sh não encontrado!"
fi

# Verificar se o Node.js está disponível
if command -v node &> /dev/null; then
  echo "Node.js disponível: $(node -v)"
else
  echo "ERRO: Node.js não encontrado no PATH!"
fi

# Verificar disponibilidade do TypeScript
if command -v npx &> /dev/null; then
  echo "NPX disponível: $(npx --version)"
else
  echo "ERRO: NPX não encontrado no PATH!"
fi

echo "[$(date)] Fim da verificação"
echo "---------------------------------------" 