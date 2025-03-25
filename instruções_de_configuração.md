# Instruções para Configuração do Scraper Automatizado no VPS

## Passo a Passo para Configuração do Sistema de Scraping Automático

Estas instruções guiarão na configuração do sistema de scraping de notícias para execução automática cinco vezes ao dia (9h, 12h, 15h, 18h e 21h) no VPS.

### 1. Transferir os Arquivos para o VPS

```bash
scp scheduled_scraper.sh import_articles.ts crontab-config.txt cron_debug.sh seu_usuario@seu_vps:/var/www/madua/
```

### 2. Acessar o VPS e Configurar os Scripts

```bash
# Acessar o servidor
ssh seu_usuario@seu_vps

# Navegar até o diretório da aplicação
cd /var/www/madua

# Tornar os scripts executáveis
chmod +x scheduled_scraper.sh scraper.sh cron_debug.sh

# Editar o arquivo crontab-config.txt
nano crontab-config.txt
```

No editor, substituir `/caminho/completo/para/o/projeto` por `/var/www/madua` em todas as linhas.

### 3. Instalar o Crontab

```bash
# Instalar o crontab
crontab crontab-config.txt

# Verificar se foi instalado corretamente
crontab -l
```

Você deverá ver as cinco entradas do cron configuradas para os horários especificados.

### 4. Executar um Teste Manual

```bash
# Executar o script de scraping manualmente para testar
./scheduled_scraper.sh
```

Isso executará o processo completo:
1. Scraping de artigos do YnetNews
2. Importação dos artigos para o banco de dados
3. Processamento dos artigos (tradução via OpenAI e publicação)

### 5. Verificar Logs e Depuração

#### Logs do Scraper
```bash
# Verificar logs gerados pelo scraper
ls -la logs/
cat logs/scraper_mais_recente.log
```

#### Logs do Cron
```bash
# Verificar logs do sistema para o cron
grep CRON /var/log/syslog
```

#### Executar Script de Depuração
```bash
# Executar o script de depuração manualmente
./cron_debug.sh
```

### 6. Ajustes Finais

#### Ajustar Número de Artigos
Para alterar o número de artigos obtidos em cada execução (padrão: 10):

```bash
# Editar o script scheduled_scraper.sh
nano scheduled_scraper.sh
```

Alterar o valor da variável `ARTICLES_LIMIT`.

#### Adicionar ao PM2 (Opcional)
Se preferir, você pode usar o PM2 para agendamento em vez do cron:

```bash
# Instalar o módulo pm2-cron
npm install pm2-cron -g

# Configurar o job no PM2
pm2 start scheduled_scraper.sh --cron "0 9,12,15,18,21 * * *" --name "news-scraper"

# Salvar a configuração do PM2
pm2 save
```

### 7. Estrutura de Arquivos e Diretórios

Após a configuração, você terá a seguinte estrutura:

```
/var/www/madua/
  ├── scraper.sh                 # Script principal de scraping
  ├── scheduled_scraper.sh       # Script para execução automática
  ├── import_articles.ts         # Script para importar artigos para o banco
  ├── process_all_articles.ts    # Script para processar e traduzir artigos
  ├── cron_debug.sh              # Script para depuração do cron
  ├── logs/                      # Diretório de logs
  ├── processed_files/           # Arquivos JSON processados
  └── public/article-images/     # Imagens baixadas dos artigos
```

## Manutenção e Monitoramento

### Monitoramento Diário
Recomenda-se verificar os logs diariamente nas primeiras semanas:

```bash
# Listar os últimos logs
ls -lat logs/

# Verificar o log mais recente
cat logs/$(ls -t logs/ | head -1)
```

### Backup dos Arquivos JSON
Os arquivos JSON são salvos em `processed_files/`. É recomendável configurar um backup periódico desses arquivos.

### Verificação do Banco de Dados
Verifique periodicamente se os artigos estão sendo corretamente importados e processados:

```bash
# Acessar o banco de dados
psql -U seu_usuario -d seu_banco

# Verificar os artigos importados
SELECT COUNT(*), status FROM "ScrapedArticle" GROUP BY status;
```

---

Para qualquer dúvida ou problema, consulte o arquivo `SCRAPER_README.md` para informações adicionais sobre a solução de problemas. 