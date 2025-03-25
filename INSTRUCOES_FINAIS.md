# Instruções Finais para o VPS - Corrigindo o Problema TypeScript

Agora que você enfrentou problemas com a execução de arquivos TypeScript no VPS, aqui estão instruções atualizadas para resolver isso:

## 1. Verificar o erro atual

O erro que você encontrou (`ERR_UNKNOWN_FILE_EXTENSION`) indica que o Node.js não consegue executar arquivos .ts diretamente. Isso acontece porque o Node.js não reconhece arquivos TypeScript sem ferramentas adicionais.

## 2. Solução: Usando um script final atualizado

Criamos um script que resolve tanto o problema do ambiente Python quanto o problema com TypeScript:

```bash
# Torne o script executável
chmod +x run_scraper_final.sh

# Teste a execução
./run_scraper_final.sh
```

Este script:
1. Executa o scraper Python corretamente
2. Instala ts-node localmente se necessário
3. Usa o ts-node local para executar os scripts TypeScript

## 3. Atualizar o crontab

```bash
# Edite o crontab
crontab -e
```

Substitua o conteúdo por:

```
# Configuração de Cron para execução do web scraper 5 vezes ao dia
0 9 * * * cd /var/www/madua && ./run_scraper_final.sh
0 12 * * * cd /var/www/madua && ./run_scraper_final.sh
0 15 * * * cd /var/www/madua && ./run_scraper_final.sh
0 18 * * * cd /var/www/madua && ./run_scraper_final.sh
0 21 * * * cd /var/www/madua && ./run_scraper_final.sh
```

Salve e saia do editor.

## 4. Instalação prévia das dependências

Para garantir que tudo funcionará sem problemas, execute:

```bash
# Instalar ts-node e typescript localmente no projeto
npm install --save-dev ts-node typescript @types/node

# Verificar a instalação
ls -la node_modules/.bin/ts-node
```

## 5. Verificação final

Execute manualmente o script para verificar:

```bash
./run_scraper_final.sh
```

Verifique os logs para confirmar que tudo funcionou corretamente:

```bash
ls -la logs/
cat logs/$(ls -t logs/ | head -1)
```

Se tudo correr bem, você verá que:
1. Os artigos foram extraídos com sucesso
2. Os artigos foram importados para o banco de dados
3. Os artigos foram processados (traduzidos e publicados)

Agora o scraper deve ser executado automaticamente nos horários programados (9h, 12h, 15h, 18h e 21h) sem nenhum problema. 