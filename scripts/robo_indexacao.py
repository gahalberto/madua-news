#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import requests
import logging
import time
from datetime import datetime
from typing import Dict, List, Optional, Union
from google.oauth2 import service_account
from google.auth.transport.requests import Request
from dotenv import load_dotenv

# Carregar variáveis do .env
load_dotenv()

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("logs/indexacao_urls.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("RoboIndexacao")

class RoboIndexacao:
    def __init__(self, base_url: str = os.getenv("SITE_URL", "https://madua.com.br"), 
                 api_endpoint: str = "/api/urls"):
        """
        Inicializa o robô de indexação com as configurações básicas
        
        Args:
            base_url: URL base do site
            api_endpoint: Endpoint da API de URLs
        """
        self.base_url = base_url
        self.api_endpoint = api_endpoint
        self.api_url = f"{base_url}{api_endpoint}"
        self.session = requests.Session()
        
        # Configurações para o Google Indexing API
        self.google_indexing_email = os.getenv("GOOGLE_INDEXING_CLIENT_EMAIL")
        self.google_indexing_key = os.getenv("GOOGLE_INDEXING_PRIVATE_KEY")
        
        # Tratamento aprimorado da chave privada
        if self.google_indexing_key:
            # Garantir que a chave tenha as quebras de linha corretas
            self.google_indexing_key = self.google_indexing_key.replace('\\n', '\n')
            
            # Verificar se a chave começa e termina corretamente
            if not self.google_indexing_key.startswith('-----BEGIN PRIVATE KEY-----'):
                logger.warning("Formato da chave privada parece incorreto (início)")
            if not self.google_indexing_key.strip().endswith('-----END PRIVATE KEY-----'):
                logger.warning("Formato da chave privada parece incorreto (fim)")
                
            logger.info(f"Chave privada carregada, tamanho: {len(self.google_indexing_key)} caracteres")
        else:
            logger.warning("Chave privada não encontrada nas variáveis de ambiente")
        
        # URL da API do Google Indexing
        self.indexing_endpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish"
        
        # Inicializar as credenciais do Google
        self.credentials = None
        self.inicializar_credenciais()
        
        # Estatísticas de indexação
        self.stats = {
            "total_urls": 0,
            "indexadas": 0,
            "falhas": 0,
            "inicio": datetime.now(),
            "fim": None
        }

    def inicializar_credenciais(self):
        """Inicializa as credenciais do Google para a API de Indexação"""
        if not self.google_indexing_email or not self.google_indexing_key:
            logger.warning("Credenciais do Google Indexing API não configuradas")
            return
            
        try:
            # Tentar criar as credenciais usando um arquivo temporário em vez de dicionário
            # Isso pode resolver problemas de formatação da chave
            import tempfile
            
            # Criar um arquivo de credenciais temporário
            with tempfile.NamedTemporaryFile(mode='w', delete=False) as temp_file:
                json_content = {
                    "type": "service_account",
                    "project_id": "madua-454823",
                    "private_key_id": "5c0da9131a46", 
                    "private_key": self.google_indexing_key,
                    "client_email": self.google_indexing_email,
                    "client_id": "114927467549897077562",
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{self.google_indexing_email}"
                }
                json.dump(json_content, temp_file)
                temp_file_path = temp_file.name
            
            # Carregar credenciais do arquivo temporário
            logger.info(f"Carregando credenciais do arquivo temporário: {temp_file_path}")
            self.credentials = service_account.Credentials.from_service_account_file(
                temp_file_path,
                scopes=["https://www.googleapis.com/auth/indexing"]
            )
            
            # Remover o arquivo temporário após o uso
            os.unlink(temp_file_path)
            
            # Atualizar token se necessário
            if not self.credentials.valid:
                self.credentials.refresh(Request())
                
            logger.info("Credenciais do Google Indexing API inicializadas com sucesso")
        except Exception as e:
            logger.error(f"Erro ao inicializar credenciais do Google: {str(e)}")
            self.credentials = None

    def obter_urls(self, tipo: Optional[str] = None, limite: Optional[int] = None) -> Dict:
        """
        Obtém as URLs do site através da API
        
        Args:
            tipo: Tipo de conteúdo (cursos, ebooks, produtos, posts)
            limite: Número máximo de URLs a serem retornadas
            
        Returns:
            Dicionário com as URLs por categoria
        """
        params = {}
        if tipo:
            params["tipo"] = tipo
        if limite:
            params["limite"] = limite
            
        try:
            logger.info(f"Consultando API em: {self.api_url}")
            response = self.session.get(self.api_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"URLs recuperadas com sucesso. Total: {data.get('meta', {}).get('total', 0)}")
            
            return data
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao consultar a API: {str(e)}")
            return {}

    def processar_urls_para_indexacao(self, urls_por_categoria: Dict) -> List[str]:
        """
        Processa as URLs de todas as categorias em uma única lista
        
        Args:
            urls_por_categoria: Dicionário com URLs por categoria
            
        Returns:
            Lista de todas as URLs para indexação
        """
        todas_urls = []
        
        # Exclui o campo 'meta' se presente
        categorias = {k: v for k, v in urls_por_categoria.items() if k != 'meta'}
        
        for categoria, urls in categorias.items():
            logger.info(f"Categoria: {categoria} - {len(urls)} URLs")
            todas_urls.extend(urls)
            
        return todas_urls

    def indexar_url(self, url: str) -> bool:
        """
        Indexa uma única URL no Google Search Console via API
        
        Args:
            url: URL a ser indexada
            
        Returns:
            True se a indexação foi bem-sucedida, False caso contrário
        """
        if not self.credentials:
            logger.error("Credenciais do Google não inicializadas")
            return False
            
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.credentials.token}"
        }

        data = {
            "url": url,
            "type": "URL_UPDATED"
        }

        try:
            response = requests.post(
                self.indexing_endpoint, 
                headers=headers, 
                data=json.dumps(data)
            )
            
            if response.status_code == 200:
                logger.info(f"✅ URL indexada com sucesso: {url}")
                return True
            else:
                logger.error(f"❌ Erro ao indexar URL {url}: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"Exceção ao indexar URL {url}: {str(e)}")
            return False

    def indexar_urls(self, urls: List[str]) -> None:
        """
        Indexa uma lista de URLs no Google Search Console
        
        Args:
            urls: Lista de URLs a serem indexadas
        """
        if not self.credentials:
            logger.warning("Credenciais do Google Indexing API não configuradas")
            return
            
        total = len(urls)
        logger.info(f"Iniciando indexação de {total} URLs")
        
        for i, url in enumerate(urls, 1):
            logger.info(f"Indexando URL {i}/{total}: {url}")
            
            success = self.indexar_url(url)
            if success:
                self.stats["indexadas"] += 1
            else:
                self.stats["falhas"] += 1
                
            # Intervalo para evitar limitações de taxa
            if i < total:
                time.sleep(1)  # Espera 1 segundo entre as requisições

    def executar(self, tipos: Optional[List[str]] = None, limite_por_tipo: Optional[int] = None) -> Dict:
        """
        Executa o processo completo de indexação
        
        Args:
            tipos: Lista de tipos de conteúdo a serem indexados (cursos, ebooks, produtos, posts)
            limite_por_tipo: Limite de URLs por tipo
            
        Returns:
            Estatísticas da execução
        """
        logger.info("Iniciando processo de indexação")
        self.stats["inicio"] = datetime.now()
        
        if tipos:
            todas_urls = []
            for tipo in tipos:
                logger.info(f"Obtendo URLs do tipo: {tipo}")
                urls_categoria = self.obter_urls(tipo=tipo, limite=limite_por_tipo)
                urls_processadas = self.processar_urls_para_indexacao(urls_categoria)
                todas_urls.extend(urls_processadas)
        else:
            # Obter todas as URLs de uma vez
            urls_todas_categorias = self.obter_urls()
            todas_urls = self.processar_urls_para_indexacao(urls_todas_categorias)
        
        self.stats["total_urls"] = len(todas_urls)
        
        # Indexar as URLs
        if todas_urls:
            logger.info(f"Indexando {len(todas_urls)} URLs")
            self.indexar_urls(todas_urls)
        else:
            logger.warning("Nenhuma URL para indexar")
            
        self.stats["fim"] = datetime.now()
        duracao = self.stats["fim"] - self.stats["inicio"]
        self.stats["duracao_segundos"] = duracao.total_seconds()
        
        logger.info(f"Processo concluído. Duração: {duracao}")
        logger.info(f"Estatísticas: {self.stats}")
        
        return self.stats

# Função principal para ser chamada da linha de comando
def main():
    import argparse
    
    # Criar diretório de logs se não existir
    os.makedirs("logs", exist_ok=True)
    
    # Configurar os argumentos da linha de comando
    parser = argparse.ArgumentParser(description="Robô de indexação do site Madua")
    parser.add_argument("--tipo", type=str, help="Tipo de conteúdo a ser indexado (cursos, ebooks, produtos, posts)")
    parser.add_argument("--limite", type=int, help="Limite de URLs por tipo")
    parser.add_argument("--local", action="store_true", help="Usar API local (http://localhost:3000)")
    
    args = parser.parse_args()
    
    # Configurar a URL base
    base_url = "http://localhost:3000" if args.local else os.getenv("SITE_URL", "https://madua.com.br")
    
    # Instanciar o robô
    robo = RoboIndexacao(base_url=base_url)
    
    # Executar para tipos específicos ou todos
    tipos = [args.tipo] if args.tipo else None
    resultados = robo.executar(tipos=tipos, limite_por_tipo=args.limite)
    
    # Exibir resumo
    print("\n===== RESUMO DA INDEXAÇÃO =====")
    print(f"Total de URLs: {resultados['total_urls']}")
    print(f"URLs indexadas com sucesso: {resultados['indexadas']}")
    print(f"Falhas de indexação: {resultados['falhas']}")
    print(f"Duração total: {resultados['duracao_segundos']:.2f} segundos")

# Executar se chamado diretamente
if __name__ == "__main__":
    main() 