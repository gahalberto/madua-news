#!/bin/bash

# Script para executar o robô de indexação do site Madua
# Uso: bash scripts/indexacao.sh [tipo] [limite]
# Exemplo: bash scripts/indexacao.sh posts 10

# Carregar variáveis de ambiente de forma segura
if [ -f .env ]; then
  # Ao invés de usar export com xargs, vamos usar source diretamente
  set -a
  source .env
  set +a
fi

# Verificar se python está instalado
if ! command -v python3 &> /dev/null; then
    echo "Python3 não está instalado. Por favor, instale-o primeiro."
    exit 1
fi

# Criar pasta de logs se não existir
mkdir -p logs

# Registrar início da execução
echo "===== INICIANDO INDEXAÇÃO EM $(date) =====" | tee -a logs/indexacao.log

# Verificar se o ambiente virtual existe
if [ -d "venv" ] || [ -d ".venv" ]; then
    # Ativar ambiente virtual (tenta ambos os nomes comuns)
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    elif [ -f ".venv/bin/activate" ]; then
        source .venv/bin/activate
    fi
    echo "Ambiente virtual ativado" | tee -a logs/indexacao.log
else
    echo "AVISO: Ambiente virtual não encontrado, usando Python do sistema" | tee -a logs/indexacao.log
fi

# Instalar dependências se necessário
echo "Verificando dependências..." | tee -a logs/indexacao.log
pip install -q requests google-auth google-api-python-client python-dotenv

# Executar o robô de indexação
echo "Executando robô de indexação..." | tee -a logs/indexacao.log

# Verificar argumentos (tipo e limite)
TIPO_ARG=""
LIMITE_ARG=""

if [ ! -z "$1" ]; then
    TIPO_ARG="--tipo $1"
    echo "Filtrando por tipo: $1" | tee -a logs/indexacao.log
fi

if [ ! -z "$2" ]; then
    LIMITE_ARG="--limite $2"
    echo "Limitando a $2 URLs por tipo" | tee -a logs/indexacao.log
fi

# Verificar se estamos em ambiente local
if [[ $SITE_URL == *"localhost"* ]]; then
    echo "Modo de desenvolvimento detectado" | tee -a logs/indexacao.log
    python3 scripts/robo_indexacao.py $TIPO_ARG $LIMITE_ARG --local | tee -a logs/indexacao.log
else
    echo "Modo de produção detectado" | tee -a logs/indexacao.log
    python3 scripts/robo_indexacao.py $TIPO_ARG $LIMITE_ARG | tee -a logs/indexacao.log
fi

# Restaurar ambiente original se estávamos usando venv
if [ -n "$VIRTUAL_ENV" ]; then
    deactivate
    echo "Ambiente virtual desativado" | tee -a logs/indexacao.log
fi

echo "===== INDEXAÇÃO CONCLUÍDA EM $(date) =====" | tee -a logs/indexacao.log 