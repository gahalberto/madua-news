import os
import json
import requests
from dotenv import load_dotenv
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Carregar variáveis do .env
load_dotenv()

SITE_URL = os.getenv("SITE_URL")
CLIENT_EMAIL = os.getenv("GOOGLE_INDEXING_CLIENT_EMAIL")
PRIVATE_KEY = os.getenv("GOOGLE_INDEXING_PRIVATE_KEY").replace("\\n", "\n")

# Configurar credenciais da API do Google
credentials = service_account.Credentials.from_service_account_info(
    {
        "type": "service_account",
        "project_id": "madua-454823",
        "private_key_id": "YOUR_PRIVATE_KEY_ID",  # Substituir pelo ID real
        "private_key": PRIVATE_KEY,
        "client_email": CLIENT_EMAIL,
        "client_id": "YOUR_CLIENT_ID",  # Substituir pelo ID real
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{CLIENT_EMAIL}"
    },
    scopes=["https://www.googleapis.com/auth/indexing"]
)

# URL da API de Indexing
INDEXING_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish"

def index_url(url):
    """Envia uma URL para indexação no Google."""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {credentials.token if credentials.valid else credentials.refresh(requests.Request())}"
    }

    data = {
        "url": url,
        "type": "URL_UPDATED"
    }

    response = requests.post(INDEXING_ENDPOINT, headers=headers, data=json.dumps(data))
    
    if response.status_code == 200:
        print(f"✅ URL enviada com sucesso: {url}")
    else:
        print(f"❌ Erro ao enviar URL: {url}")
        print(response.text)

if __name__ == "__main__":
    urls = [
        f"{SITE_URL}/",
        f"{SITE_URL}/sobre",
        f"{SITE_URL}/contato",
    ]  # Adicione mais URLs conforme necessário
    
    for url in urls:
        index_url(url)
