# Instruções Resumidas para Configuração do Scraper Automatizado

## Comandos Rápidos para Configuração no VPS

```bash
# 1. Criar estrutura de diretórios
mkdir -p logs processed_files

# 2. Tornar scripts executáveis
chmod +x scraper.sh scheduled_scraper.sh cron_debug.sh

# 3. Editar crontab-config.txt (substitua /var/www/madua pelo caminho real)
sed -i 's|/caminho/completo/para/o/projeto|/var/www/madua|g' crontab-config.txt

# 4. Instalar crontab
crontab crontab-config.txt

# 5. Verificar crontab
crontab -l

# 6. Executar teste manual
./scheduled_scraper.sh
```

## Verificação de Funcionamento

```bash
# Verificar logs
ls -la logs/

# Verificar se os artigos foram importados
npx prisma studio

# Verificar status dos artigos no banco
npx ts-node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const stats = await prisma.$queryRaw\`
    SELECT status, COUNT(*) FROM \"ScrapedArticle\" GROUP BY status
  \`;
  console.table(stats);
  await prisma.$disconnect();
}
check();
"
```

## Horários Configurados

- **9:00** - Primeira execução do dia
- **12:00** - Segunda execução
- **15:00** - Terceira execução
- **18:00** - Quarta execução
- **21:00** - Quinta execução

## Arquivos Criados

1. `scheduled_scraper.sh` - Script principal de automação
2. `import_articles.ts` - Importação para o banco
3. `crontab-config.txt` - Configuração do cron
4. `cron_debug.sh` - Script de depuração
5. `SCRAPER_README.md` - Documentação detalhada
6. `instruções_de_configuração.md` - Guia passo a passo 