#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup
import json
import time
import re
import os

class YnetNewsScraper:
    def __init__(self):
        self.base_url = "https://www.ynetnews.com"
        self.category_url = f"{self.base_url}/category/3082"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
        self.articles = []
    
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
        
        # Extrair o conteúdo do artigo
        content_paragraphs = soup.find_all('div', class_='text_editor_paragraph')
        content = ""
        for paragraph in content_paragraphs:
            # Encontra o texto dentro de cada parágrafo
            spans = paragraph.find_all('span', {'data-text': 'true'})
            for span in spans:
                content += span.text.strip() + "\n\n"
        
        # Criar e retornar o objeto de artigo
        article = {
            'url': url,
            'title': title,
            'description': subtitle,
            'content': content.strip()
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