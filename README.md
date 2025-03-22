# Web Scraper Ynet News

Este é um script Python para fazer web scraping de artigos do [Ynet News](https://www.ynetnews.com/category/3082).

## Funcionalidades

- Extrai links de artigos recentes da página principal da categoria
- Extrai título, descrição e conteúdo de cada artigo
- Salva os resultados em um arquivo JSON
- Envia os artigos automaticamente para a API
- Suporte a execução programada via cron

## Requisitos

Para executar este script, você precisa:

```
python3
python3-venv (para ambientes virtuais Python)
```

E as seguintes bibliotecas Python (instaladas automaticamente pelo script):

```
requests
beautifulsoup4
```

## Instalação

### Método 1: Usando o Script Automatizado (Recomendado)

O script `scraper.sh` configura automaticamente um ambiente virtual Python e instala todas as dependências necessárias:

```bash
# Torne o script executável
chmod +x scraper.sh

# Execute o script
./scraper.sh
```

O script irá:
1. Verificar se Python está instalado
2. Criar um ambiente virtual Python (`.venv`)
3. Instalar todas as dependências necessárias
4. Solicitar os parâmetros de execução (número de artigos e nome do arquivo de saída)
5. Executar o web scraper

### Método 2: Instalação Manual

Se preferir configurar manualmente:

1. Crie um ambiente virtual Python:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Instale as dependências:
   ```bash
   pip install requests beautifulsoup4
   ```

3. Execute o script:
   ```bash
   python3 ynetnews_scraper.py
   ```

## Automação do Scraper

### Execução Automatizada

O sistema possui duas formas de automatizar a extração de dados:

1. **Execução Agendada**: O scraper pode ser configurado para rodar automaticamente todos os dias às 18h usando cron:
   ```bash
   # Instalar o agendamento no crontab
   crontab cronfile.txt
   
   # Verificar se o cron foi configurado corretamente
   crontab -l
   ```

2. **Execução Manual**: O scraper também pode ser executado manualmente através da interface administrativa:
   - Acesse o painel administrativo em `/admin/scraped-articles`
   - Clique no botão "Executar Scraper" no topo da página

### Script de Automação

O `scraper_auto.sh` é um script não interativo que:
- Configura automaticamente o ambiente virtual
- Extrai os artigos
- Envia os dados para a API
- Registra a saída em um arquivo de log

Para testar o script de automação manualmente:
```bash
chmod +x scraper_auto.sh
./scraper_auto.sh
```

## Personalizando

Você pode personalizar o script de várias formas:

### Usando o Script Automatizado

Ao executar `./scraper.sh`, o script solicitará:
- O número de artigos a extrair (padrão: 10)
- O nome do arquivo de saída (padrão: ynetnews_articles.json)

### Editando o Código

Você também pode personalizar o script editando os parâmetros na seção principal:

- Altere o número de artigos a serem extraídos modificando o valor de `limit`
- Altere o nome do arquivo de saída modificando o parâmetro em `save_to_json()`

### Usando como Módulo

Veja o arquivo `exemplo_uso.py` para um exemplo de como importar e usar a classe `YnetNewsScraper` em seu próprio código.

## Notas Importantes

- Este script faz pausas entre as requisições para não sobrecarregar o servidor
- Use este script com responsabilidade e de acordo com os Termos de Serviço do site
- O scraping de sites sem permissão pode violar os termos de uso do site

## Estrutura do JSON de Saída

O arquivo JSON gerado terá a seguinte estrutura:

```json
[
  {
    "url": "URL do artigo",
    "title": "Título do artigo",
    "description": "Descrição/subtítulo do artigo",
    "content": "Conteúdo completo do artigo"
  },
  ...
]
```
