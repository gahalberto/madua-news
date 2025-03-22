#!/bin/bash

# Script para executar o scraper automaticamente e enviar os dados para a API
# Este script é feito para ser executado via cron ou manualmente

# Define o diretório raiz do projeto (ajuste se necessário)
PROJECT_DIR="$(dirname "$0")"
cd "$PROJECT_DIR"

echo "=== Executando Web Scraper Automatico - $(date) ==="
echo ""

# Verifica se o Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "ERRO: Python 3 não foi encontrado."
    exit 1
fi

# Diretório do ambiente virtual
VENV_DIR="venv"

# Verifica se o ambiente virtual existe
if [ ! -d "$VENV_DIR" ]; then
    echo "ERRO: Ambiente virtual não encontrado em $VENV_DIR"
    echo "Execute setup_scraper.sh primeiro"
    exit 1
fi

# Define o Python do ambiente virtual
PYTHON_PATH="$VENV_DIR/bin/python3"

# Define parâmetros fixos
LIMIT=10
OUTPUT="ynetnews_articles.json"
API_URL="http://localhost:3000/api/scraper"
PROCESS_API_URL="http://localhost:3000/api/admin/scraper/process-all?skip-auth=true"

echo "Iniciando extração de $LIMIT artigos..."
echo "Os resultados serão salvos em: $OUTPUT"

# Executa o scraper em modo silencioso
"$PYTHON_PATH" - <<EOF
import sys
sys.path.append('.')
from ynetnews_scraper import YnetNewsScraper

scraper = YnetNewsScraper()
articles = scraper.scrape_articles(limit=$LIMIT)
scraper.save_to_json("$OUTPUT")

print(f"Total de artigos extraídos: {len(articles)}")
EOF

# Envia os dados para a API
"$PYTHON_PATH" - <<EOF
import sys
sys.path.append('.')
import json
import requests

# Função para ler o arquivo JSON
def ler_arquivo_json(arquivo):
    try:
        with open(arquivo, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"ERRO ao ler o arquivo JSON: {e}")
        return None

# Função para enviar dados para a API
def enviar_para_api(dados, url_api):
    try:
        print(f"Enviando dados para a API: {url_api}")
        resposta = requests.post(url_api, json=dados)
        
        if resposta.status_code == 200:
            resultado = resposta.json()
            print("Dados enviados com sucesso!")
            print(f"Resposta completa: {json.dumps(resultado, indent=2)}")
            
            # Imprimir estatísticas de forma legível
            if 'stats' in resultado:
                stats = resultado['stats']
                print("\nResumo da importação:")
                print(f"- Artigos recebidos: {stats.get('received', 0)}")
                print(f"- Artigos novos salvos: {stats.get('saved', 0)}")
                print(f"- Artigos duplicados ignorados: {stats.get('duplicates', 0)}")
                print(f"- Erros durante processamento: {stats.get('errors', 0)}")
            
            return True, resultado
        else:
            print(f"ERRO: A API retornou código de status {resposta.status_code}")
            print(f"Resposta: {resposta.text}")
            return False, None
    except Exception as e:
        print(f"ERRO ao enviar dados para a API: {e}")
        return False, None

# Lê os dados do arquivo
dados = ler_arquivo_json("$OUTPUT")

if not dados:
    print("Nenhum dado encontrado para enviar.")
    sys.exit(1)

# Envia os dados para a API
sucesso, resultado = enviar_para_api(dados, "$API_URL")

if not sucesso:
    print("A operação falhou. Verifique os erros acima.")
    sys.exit(1)

print("Dados importados com sucesso!")

# Verifica se artigos foram salvos
artigos_novos = resultado.get('stats', {}).get('saved', 0)
if artigos_novos > 0:
    # Iniciar processamento automático dos artigos
    print("\n=== Iniciando processamento automático dos artigos ===")
    try:
        print(f"Chamando API de processamento: {'$PROCESS_API_URL'}")
        resposta_proc = requests.post("$PROCESS_API_URL", json={})
        
        if resposta_proc.status_code == 200:
            resultado_proc = resposta_proc.json()
            print("Processamento iniciado com sucesso!")
            print(f"Resposta: {json.dumps(resultado_proc, indent=2)}")
        else:
            print(f"ERRO: A API de processamento retornou código {resposta_proc.status_code}")
            print(f"Resposta: {resposta_proc.text}")
    except Exception as e:
        print(f"ERRO ao iniciar processamento automático: {e}")
else:
    print("Nenhum artigo novo para processar.")

print("Operação completa!")
EOF

echo ""
echo "=== Extração e envio concluídos ==="
echo "Execução finalizada em: $(date)" 