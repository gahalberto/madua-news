#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup
import json
import time
import re
import os
import uuid
from urllib.parse import urlparse

class YnetNewsScraper:
    def __init__(self):
        self.base_url = "https://www.ynetnews.com"
        self.category_url = f"{self.base_url}/category/3082"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
        self.articles = []
        self.image_dir = os.path.join(os.getcwd(), 'public', 'article-images')
        
        # Criar diretório de imagens se não existir
        os.makedirs(self.image_dir, exist_ok=True)
    
    def get_article_links(self):
        """Extrai os links dos artigos mais recentes"""
        print("Extraindo links de artigos...")
        response = requests.get(self.category_url, headers=self.headers)
        
        if response.status_code != 200:
            print(f"Erro ao acessar a página: {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.text, 'html.parser')
        article_links = []
        
        # Encontra os links dentro da classe slotView
        slot_views = soup.find_all('div', class_='slotView')
        for slot in slot_views:
            links = slot.find_all('a')
            for link in links:
                href = link.get('href')
                if href and href.startswith("https://www.ynetnews.com/article/"):
                    if href not in article_links:
                        article_links.append(href)
        
        print(f"Encontrados {len(article_links)} links de artigos")
        return article_links
    
    def download_image(self, image_url, article_title=None):
        """Baixa a imagem e salva localmente usando o título do artigo como referência"""
        try:
            if not image_url:
                return None
                
            print(f"Baixando imagem: {image_url}")
            
            # Gerar nome de arquivo baseado no título do artigo ou usar UUID se não disponível
            if article_title:
                # Limpar o título para usar como nome de arquivo
                filename_base = re.sub(r'[^\w\s-]', '', article_title.lower())  # Remove caracteres especiais
                filename_base = re.sub(r'\s+', '-', filename_base).strip('-')  # Substitui espaços por hífens
                # Limitar o tamanho do nome do arquivo
                filename_base = filename_base[:50]
            else:
                filename_base = f"ynet-{uuid.uuid4().hex[:8]}"
            
            # Adicionar extensão do arquivo
            image_extension = os.path.splitext(urlparse(image_url).path)[1]
            if not image_extension:
                image_extension = '.jpg'  # Extensão padrão se não for possível determinar
                
            # Criar nome inicial do arquivo
            filename = f"{filename_base}{image_extension}"
            save_path = os.path.join(self.image_dir, filename)
            
            # Verificar se o arquivo já existe e adicionar código único se necessário
            counter = 1
            while os.path.exists(save_path):
                filename = f"{filename_base}-{counter}{image_extension}"
                save_path = os.path.join(self.image_dir, filename)
                counter += 1
            
            # Fazer a requisição e salvar a imagem
            response = requests.get(image_url, headers=self.headers, stream=True)
            if response.status_code == 200:
                with open(save_path, 'wb') as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
                print(f"Imagem salva em: {save_path}")
                return f"/article-images/{filename}"
            else:
                print(f"Erro ao baixar imagem: {response.status_code}")
                return None
        except Exception as e:
            print(f"Erro ao processar imagem: {e}")
            return None
    
    def filter_unwanted_content(self, text):
        """Filtra conteúdos indesejados do texto"""
        # Lista de textos a serem filtrados
        textos_indesejados = [
            "Ynetnews", 
            "Google Play", 
            "Apple App Store", 
            "Facebook", 
            "Twitter", 
            "Instagram", 
            "Telegram",
            "https://bit.ly/",  # URLs encurtados típicos nos artigos
            "Follow Ynetnews",
            "Get the Ynetnews app",
            "smartphone"
        ]
        
        # Remove linhas que contenham qualquer texto indesejado
        filtered_lines = []
        for line in text.split('\n'):
            should_skip = any(texto in line for texto in textos_indesejados)
            if not should_skip:
                filtered_lines.append(line)
        
        # Remove padrões de mensagens de rodapé típicas
        filtered_text = '\n'.join(filtered_lines)
        
        # Remove linhas vazias repetidas (mais de 2 quebras de linha seguidas)
        while '\n\n\n' in filtered_text:
            filtered_text = filtered_text.replace('\n\n\n', '\n\n')
            
        return filtered_text.strip()

    def extract_article_content(self, url):
        """Extrai o conteúdo de um artigo específico"""
        print(f"Extraindo conteúdo de: {url}")
        
        # Adiciona um atraso para evitar sobrecarregar o servidor
        time.sleep(1)
        
        response = requests.get(url, headers=self.headers)
        if response.status_code != 200:
            print(f"Erro ao acessar o artigo: {response.status_code}")
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extrair o título
        title_tag = soup.find('h1', class_='mainTitle')
        title = title_tag.text if title_tag else "Título não encontrado"
        
        # Extrair o subtítulo/descrição
        subtitle_tag = soup.find('span', class_='subTitle')
        subtitle = subtitle_tag.text if subtitle_tag else "Subtítulo não encontrado"
        
        # Extrair imagem principal
        main_image_url = None
        main_image_local_path = None
        
        # Procurar imagem de artigo (várias estratégias possíveis)
        # Método 1: procurar por tags de imagem no artigo
        main_image = soup.find('img', id=lambda x: x and x.startswith('ReduxEditableImage_ArticleImageData'))
        if main_image and main_image.get('src'):
            main_image_url = main_image.get('src')
            print(f"Imagem principal encontrada: {main_image_url}")
            main_image_local_path = self.download_image(main_image_url, title)
        
        # Método 2: procurar pela div que contém a imagem principal
        if not main_image_url:
            image_container = soup.find('div', class_='mainMedia')
            if image_container:
                img_tag = image_container.find('img')
                if img_tag and img_tag.get('src'):
                    main_image_url = img_tag.get('src')
                    print(f"Imagem principal encontrada (método 2): {main_image_url}")
                    main_image_local_path = self.download_image(main_image_url, title)
        
        # Extrair o conteúdo do artigo
        content_paragraphs = soup.find_all('div', class_='text_editor_paragraph')
        content = ""
        for paragraph in content_paragraphs:
            # Encontra o texto dentro de cada parágrafo
            spans = paragraph.find_all('span', {'data-text': 'true'})
            for span in spans:
                content += span.text.strip() + "\n\n"
        
        # Filtrar o conteúdo para remover textos indesejados
        filtered_content = self.filter_unwanted_content(content)
        
        # Procurar por imagens dentro do conteúdo 
        content_images = []
        article_content = soup.find('div', class_='mainContent')
        if article_content:
            img_tags = article_content.find_all('img')
            for img in img_tags:
                if img.get('src') and img.get('src') != main_image_url:
                    img_url = img.get('src')
                    img_local_path = self.download_image(img_url, f"{title}-content-img")
                    if img_local_path:
                        content_images.append({
                            'original_url': img_url,
                            'local_path': img_local_path
                        })
        
        # Criar e retornar o objeto de artigo
        article = {
            'url': url,
            'title': title,
            'description': subtitle,
            'content': filtered_content,
            'main_image': {
                'original_url': main_image_url,
                'local_path': main_image_local_path
            },
            'content_images': content_images
        }
        
        return article
    
    def scrape_articles(self, limit=5):
        """Faz o scraping dos artigos, limitado por 'limit'"""
        article_links = self.get_article_links()
        
        # Limita a quantidade de artigos para scraping
        article_links = article_links[:min(limit, len(article_links))]
        
        for url in article_links:
            article = self.extract_article_content(url)
            if article:
                self.articles.append(article)
                print(f"Artigo extraído: {article['title']}")
        
        return self.articles
    
    def save_to_json(self, filename="ynetnews_articles.json"):
        """Salva os artigos em um arquivo JSON"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.articles, f, ensure_ascii=False, indent=4)
        print(f"Artigos salvos em {filename}")

# Execução principal
if __name__ == "__main__":
    scraper = YnetNewsScraper()
    articles = scraper.scrape_articles(limit=10)  # Limita a 10 artigos
    scraper.save_to_json()
    
    print(f"\nResumo:")
    print(f"Total de artigos extraídos: {len(articles)}")
    for i, article in enumerate(articles, 1):
        print(f"{i}. {article['title']}")
        if article['main_image']['local_path']:
            print(f"   Imagem principal: {article['main_image']['local_path']}")
        if article['content_images']:
            print(f"   Imagens adicionais: {len(article['content_images'])}") 