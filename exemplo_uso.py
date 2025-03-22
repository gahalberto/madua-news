#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# Importa a classe YnetNewsScraper do nosso script
from ynetnews_scraper import YnetNewsScraper

def main():
    """
    Exemplo de como utilizar a classe YnetNewsScraper em outro programa Python
    """
    print("=== Exemplo de uso do YnetNewsScraper ===")
    
    # Cria uma instância do scraper
    scraper = YnetNewsScraper()
    
    # Executa o scraping com parâmetros personalizados
    # Neste exemplo, vamos extrair apenas 3 artigos
    articles = scraper.scrape_articles(limit=3)
    
    # Salva os resultados em um arquivo JSON com nome personalizado
    scraper.save_to_json("exemplo_artigos.json")
    
    # Demonstra como processar os artigos diretamente
    print("\n=== Processando os artigos obtidos ===")
    for i, article in enumerate(articles, 1):
        print(f"\nArtigo #{i}: {article['title']}")
        print(f"URL: {article['url']}")
        print(f"Descrição: {article['description']}")
        
        # Exibe apenas uma prévia do conteúdo (primeiros 150 caracteres)
        content_preview = article['content'][:150] + "..." if len(article['content']) > 150 else article['content']
        print(f"Prévia do conteúdo: {content_preview}")
        
        # Calcula algumas estatísticas básicas
        word_count = len(article['content'].split())
        print(f"Número de palavras: {word_count}")
        
        # Demonstra como você poderia fazer análises adicionais
        # Por exemplo, calcular o sentimento do título (simulado)
        sentiment = "positivo" if len(article['title']) % 2 == 0 else "negativo"
        print(f"Exemplo de análise - Sentimento do título: {sentiment}")
        
        print("-" * 50)

if __name__ == "__main__":
    main() 