# Configuração do Web Scraper Automatizado

Este documento descreve como configurar e utilizar o sistema automatizado de scraping de notícias.

## Visão Geral

O sistema consiste em:

1. **scraper.sh** - Script principal que executa o scraping de artigos do YnetNews
2. **scheduled_scraper.sh** - Script para execução automatizada via cron
3. **import_articles.ts** - Script TypeScript que importa artigos do JSON para o banco de dados
4. **process_all_articles.ts** - Script TypeScript que processa os artigos importados (tradução via OpenAI)

## Pré-requisitos

- Node.js e npm instalados
- Python 3.6+ instalado
- Banco de dados PostgreSQL configurado
- API key da OpenAI (configurada no .env)

## Instalação

### 1. Tornando os scripts executáveis

```bash
chmod +x scraper.sh scheduled_scraper.sh cron_debug.sh
```

### 2. Configuração do ambiente

Certifique-se de que o arquivo `.env` contenha as variáveis necessárias:

```
DATABASE_URL=postgresql://usuario:senha@localhost:5432/meu_banco
OPENAI_API_KEY=sua_chave_api_openai
```

### 3. Configuração do cron

Edite o arquivo `crontab-config.txt` para definir o caminho correto do projeto:

```
0 9 * * * cd /caminho/completo/para/o/projeto && ./scheduled_scraper.sh
0 12 * * * cd /caminho/completo/para/o/projeto && ./scheduled_scraper.sh
0 15 * * * cd /caminho/completo/para/o/projeto && ./scheduled_scraper.sh
0 18 * * * cd /caminho/completo/para/o/projeto && ./scheduled_scraper.sh
0 21 * * * cd /caminho/completo/para/o/projeto && ./scheduled_scraper.sh
```

Instale o crontab:

```bash
crontab crontab-config.txt
```

Verifique se a instalação foi bem-sucedida:

```bash
crontab -l
```

## Uso Manual

Para executar o scraper manualmente:

```bash
./scheduled_scraper.sh
```

## Depuração

Para verificar se o cron está configurado corretamente:

1. Descomente a linha de depuração no crontab:
   ```
   */5 * * * * cd /caminho/completo/para/o/projeto && ./cron_debug.sh >> /tmp/cron_madua.log 2>&1
   ```

2. Reinstale o crontab:
   ```bash
   crontab crontab-config.txt
   ```

3. Verifique o log após 5 minutos:
   ```bash
   cat /tmp/cron_madua.log
   ```

## Estrutura de Diretórios Gerada

O scraper gera os seguintes diretórios:

- `logs/` - Logs de execução do scraper
- `processed_files/` - Arquivos JSON processados
- `public/article-images/` - Imagens baixadas dos artigos

## Solução de Problemas

1. **Erros de permissão**: Verifique as permissões dos scripts e diretórios
2. **Erros no cron**: Verifique o log do cron com `grep CRON /var/log/syslog`
3. **Erros de Python**: Verifique se as dependências estão instaladas
4. **Erros na API OpenAI**: Verifique a chave da API no arquivo .env

## Personalização

Para ajustar o número de artigos obtidos em cada execução, edite a variável `ARTICLES_LIMIT` no script `scheduled_scraper.sh`. 