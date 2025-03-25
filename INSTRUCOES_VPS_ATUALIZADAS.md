# Instruções Atualizadas para Configuração do Scraper no VPS

## Correção de Problemas com o Ambiente Python

Você encontrou problemas com o ambiente Python no VPS, onde o sistema está configurado como "externally managed". Seguem as instruções atualizadas:

## 1. Instalar dependências Python no sistema

```bash
# Instalar as bibliotecas necessárias a nível de sistema
apt update
apt install -y python3-requests python3-bs4
```

## 2. Usar os scripts corrigidos

Criamos versões atualizadas dos scripts que não usam ambiente virtual e funcionam com os pacotes instalados pelo sistema:

### Copiar os arquivos para os locais corretos
```bash
# Copiar scraper-fixed.sh para scraper.sh
cp scraper-fixed.sh scraper.sh

# Copiar scheduled_scraper-fixed.sh para scheduled_scraper.sh
cp scheduled_scraper-fixed.sh scheduled_scraper.sh

# Tornar os scripts executáveis
chmod +x scraper.sh scheduled_scraper.sh
```

## 3. Atualizar a configuração do cron

```bash
# Editar o arquivo crontab-config.txt se necessário
nano crontab-config.txt

# Instalar o crontab (ou reinstalar se já havia feito antes)
crontab crontab-config.txt

# Verificar a instalação
crontab -l
```

## 4. Testar a execução manual

```bash
# Executar o script manualmente para testar
./scheduled_scraper.sh
```

## 5. Verificações adicionais

### Verificar se o Node.js está configurado corretamente
```bash
# Verificar a versão do Node
node -v

# Verificar se npx funciona
npx --version
```

### Verificar permissões de diretórios
```bash
# Verifique as permissões dos diretórios de imagens
ls -la public/article-images/
```

### Verificar a estrutura de arquivos
```bash
# Listar todos os arquivos necessários
ls -la ynetnews_scraper.py import_articles.ts process_all_articles.ts
```

## 6. Problemas comuns e soluções

### Problema: Erro ao importar o módulo ynetnews_scraper
- **Solução**: Verifique se o arquivo está no mesmo diretório e tem permissões de leitura.

### Problema: Erro ao executar TypeScript com npx
- **Solução**: Certifique-se de que typescript está instalado. Execute:
  ```bash
  npm install -g typescript ts-node
  ```

### Problema: Erros ao acessar o banco de dados
- **Solução**: Verifique se a variável DATABASE_URL está configurada no arquivo .env

## 7. Logs e monitoramento

```bash
# Verificar os logs mais recentes
ls -lt logs/
cat logs/$(ls -t logs/ | head -1)
```

## 8. Execução manual para teste

Se você precisar testar o scraper sem esperar pelo cron, execute:

```bash
# Executar o script manualmente
./scheduled_scraper.sh
```

Isso deve resolver os problemas encontrados no ambiente do VPS! 