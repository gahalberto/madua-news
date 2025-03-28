#!/bin/bash

# Script para corrigir o arquivo .env e testar a indexação de URLs
# Uso: bash scripts/corrigir_e_testar.sh [tipo]
# Exemplo: bash scripts/corrigir_e_testar.sh posts

# Criar pasta de logs se não existir
mkdir -p logs

echo "===== INICIANDO PROCESSO DE CORREÇÃO E TESTE EM $(date) =====" | tee -a logs/correcao.log

# Verificar se python está instalado
if ! command -v python3 &> /dev/null; then
    echo "Python3 não está instalado. Por favor, instale-o primeiro." | tee -a logs/correcao.log
    exit 1
fi

# Verificar se o ambiente virtual existe e ativá-lo
if [ -d "venv" ] || [ -d ".venv" ]; then
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    elif [ -f ".venv/bin/activate" ]; then
        source .venv/bin/activate
    fi
    echo "Ambiente virtual ativado" | tee -a logs/correcao.log
else
    echo "AVISO: Ambiente virtual não encontrado, usando Python do sistema" | tee -a logs/correcao.log
fi

# Instalar dependências
echo "Instalando dependências necessárias..." | tee -a logs/correcao.log
pip install -q requests google-auth google-api-python-client python-dotenv

# Corrigir o arquivo .env
echo "Corrigindo o arquivo .env..." | tee -a logs/correcao.log
python3 scripts/corrigir_env.py | tee -a logs/correcao.log

# Testar a conexão com as APIs
echo "Testando a conexão com as APIs..." | tee -a logs/correcao.log

# 1. Testar a API de URLs
echo "1. Testando a API de URLs..." | tee -a logs/correcao.log
if [[ $SITE_URL == *"localhost"* ]]; then
    API_URL="http://localhost:3000/api/urls"
else
    API_URL="https://madua.com.br/api/urls"
fi

echo "URL da API: $API_URL" | tee -a logs/correcao.log
curl -s $API_URL | head -n 20 | tee -a logs/correcao.log
echo "..." | tee -a logs/correcao.log

# 2. Verificar as credenciais do Google
echo "2. Verificando as credenciais do Google..." | tee -a logs/correcao.log
cat <<EOF > scripts/verificar_credenciais.py
#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from google.oauth2 import service_account
from google.auth.transport.requests import Request

load_dotenv()

client_email = os.getenv("GOOGLE_INDEXING_CLIENT_EMAIL")
private_key = os.getenv("GOOGLE_INDEXING_PRIVATE_KEY")

if not client_email or not private_key:
    print("❌ Credenciais não encontradas no arquivo .env")
    exit(1)

private_key = private_key.replace('\\n', '\n')

print(f"📧 Email da conta de serviço: {client_email}")
print(f"🔑 Tamanho da chave privada: {len(private_key)} caracteres")
print(f"🔑 Primeiros caracteres da chave: {private_key[:20]}...")
print(f"🔑 Últimos caracteres da chave: ...{private_key[-20:]}")

try:
    import tempfile
    import json
    
    with tempfile.NamedTemporaryFile(mode='w', delete=False) as temp_file:
        json_content = {
            "type": "service_account",
            "project_id": "madua-454823",
            "private_key_id": "5c0da9131a46",
            "private_key": private_key,
            "client_email": client_email,
            "client_id": "114927467549897077562",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{client_email}"
        }
        json.dump(json_content, temp_file)
        temp_file_path = temp_file.name
    
    credentials = service_account.Credentials.from_service_account_file(
        temp_file_path,
        scopes=["https://www.googleapis.com/auth/indexing"]
    )
    
    os.unlink(temp_file_path)
    
    if credentials.valid:
        print("✅ Credenciais válidas!")
    else:
        credentials.refresh(Request())
        print("✅ Credenciais atualizadas com sucesso!")
    
    print("🔐 Token gerado com sucesso")
    
except Exception as e:
    print(f"❌ Erro ao validar credenciais: {str(e)}")
    exit(1)
EOF

python3 scripts/verificar_credenciais.py | tee -a logs/correcao.log

# 3. Executar o robô com opções limitadas
echo "3. Executando o robô de indexação com opções limitadas..." | tee -a logs/correcao.log

TIPO=""
if [ ! -z "$1" ]; then
    TIPO="--tipo $1"
    echo "Filtrando por tipo: $1" | tee -a logs/correcao.log
fi

if [[ $SITE_URL == *"localhost"* ]]; then
    python3 scripts/robo_indexacao.py $TIPO --limite 3 --local | tee -a logs/correcao.log
else
    python3 scripts/robo_indexacao.py $TIPO --limite 3 | tee -a logs/correcao.log
fi

# Restaurar ambiente original se estávamos usando venv
if [ -n "$VIRTUAL_ENV" ]; then
    deactivate
    echo "Ambiente virtual desativado" | tee -a logs/correcao.log
fi

echo "===== PROCESSO DE CORREÇÃO E TESTE CONCLUÍDO EM $(date) =====" | tee -a logs/correcao.log 