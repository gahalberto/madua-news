# Passos Simplificados para Configuração do Scraper no VPS

Depois de encontrar dificuldades com o ambiente Python, aqui está uma solução simplificada:

## 1. Instalar as bibliotecas Python necessárias

```bash
# Instalar bibliotecas Python a nível de sistema
apt update
apt install -y python3-requests python3-bs4
```

## 2. Usar o script simplificado

```bash
# Tornar executável o script simplificado
chmod +x run_scraper_simple.sh

# Testar a execução
./run_scraper_simple.sh
```

## 3. Configurar o cron para usar o script simplificado

```bash
# Editar o arquivo crontab-config.txt
nano crontab-config.txt
```

Substituir o conteúdo por:

```
# Configuração de Cron para execução do web scraper 5 vezes ao dia
0 9 * * * cd /var/www/madua && ./run_scraper_simple.sh
0 12 * * * cd /var/www/madua && ./run_scraper_simple.sh
0 15 * * * cd /var/www/madua && ./run_scraper_simple.sh
0 18 * * * cd /var/www/madua && ./run_scraper_simple.sh
0 21 * * * cd /var/www/madua && ./run_scraper_simple.sh
```

```bash
# Instalar o crontab
crontab crontab-config.txt

# Confirmar a instalação
crontab -l
```

## 4. Verificação rápida

```bash
# Verificar se o script pode ser executado
./run_scraper_simple.sh

# Verificar os logs gerados
ls -la logs/
```

---

Se encontrar problemas com o TypeScript, instale as dependências necessárias:

```bash
npm install -g typescript ts-node
npm install
```

E certifique-se de que seu arquivo .env contém a variável DATABASE_URL configurada corretamente. 