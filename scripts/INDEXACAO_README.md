# Robô de Indexação do Madua

Este robô de indexação foi desenvolvido para automatizar o processo de indexação de URLs do site Madua no Google Search Console. Ele utiliza a API de URLs do site para obter todas as URLs dos diferentes tipos de conteúdo e envia essas URLs para indexação através da API do Google Indexing.

## Funcionalidades

- Obtém URLs de todos os tipos de conteúdo (cursos, ebooks, produtos, posts) através da API `/api/urls`
- Permite filtrar por tipo específico de conteúdo
- Permite limitar o número de URLs a serem indexadas
- Registra logs detalhados do processo
- Contabiliza estatísticas de execução
- Funciona tanto em ambiente local quanto em produção

## Requisitos

- Python 3.6 ou superior
- Bibliotecas: requests, google-auth, google-api-python-client, python-dotenv
- Credenciais do Google Indexing API configuradas no arquivo .env

## Instalação

1. Certifique-se de que as bibliotecas necessárias estão instaladas:

```
pip install requests google-auth google-api-python-client python-dotenv
```

2. Configure as variáveis de ambiente no arquivo `.env`:

```
SITE_URL=https://madua.com.br
GOOGLE_INDEXING_CLIENT_EMAIL=madua-user@madua-454823.iam.gserviceaccount.com
GOOGLE_INDEXING_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Correção de Problemas com Credenciais

Se você estiver enfrentando problemas com o formato da chave privada no arquivo .env, utilize os scripts de correção fornecidos:

```bash
# Corrigir apenas o arquivo .env
python3 scripts/corrigir_env.py

# Corrigir e testar todo o processo
bash scripts/corrigir_e_testar.sh
```

O script `corrigir_e_testar.sh` realiza as seguintes operações:
1. Corrige o formato da chave privada no arquivo .env
2. Testa a conexão com a API de URLs
3. Verifica se as credenciais do Google estão válidas
4. Executa o robô de indexação com parâmetros limitados para teste

## Uso

### Uso através do script shell (recomendado)

O script shell `indexacao.sh` facilita a execução do robô, configurando o ambiente e gerenciando logs:

```bash
# Indexar todas as URLs
bash scripts/indexacao.sh

# Indexar apenas posts
bash scripts/indexacao.sh posts

# Indexar os 10 primeiros cursos
bash scripts/indexacao.sh cursos 10
```

### Uso direto do script Python

Para usuários avançados, o script Python pode ser executado diretamente:

```bash
# Indexar todas as URLs
python3 scripts/robo_indexacao.py

# Indexar apenas ebooks
python3 scripts/robo_indexacao.py --tipo ebooks

# Indexar os 5 primeiros produtos
python3 scripts/robo_indexacao.py --tipo produtos --limite 5

# Usar a API local (em desenvolvimento)
python3 scripts/robo_indexacao.py --local
```

## Logs

Os logs são gerados em dois locais:

1. No terminal durante a execução
2. No arquivo `logs/indexacao_urls.log`

Os logs incluem informações detalhadas sobre cada etapa do processo, incluindo URLs obtidas, tentativas de indexação e resultados.

## Automatização

Para automatizar a indexação, você pode configurar uma tarefa cron:

```
# Executar a indexação diariamente às 3h da manhã
0 3 * * * cd /caminho/para/projeto && bash scripts/indexacao.sh >> /var/log/indexacao_cron.log 2>&1

# Indexar apenas posts a cada 6 horas
0 */6 * * * cd /caminho/para/projeto && bash scripts/indexacao.sh posts >> /var/log/indexacao_posts.log 2>&1
```

## Resolução de Problemas

### Erros no formato da chave privada

Se você encontrar erros como "No key could be detected" ou "not a valid identifier", use o script de correção:

```bash
bash scripts/corrigir_e_testar.sh
```

Este script irá corrigir o formato da chave privada no arquivo .env e testar se as credenciais estão funcionando corretamente.

### Erros de autenticação

Verifique se as credenciais no arquivo `.env` estão corretas e se a conta de serviço tem permissões para usar a API de Indexação do Google.

### URLs não encontradas

Certifique-se de que o servidor está rodando e que a API `/api/urls` está acessível. Em desenvolvimento, use a flag `--local` para acessar `http://localhost:3000/api/urls`.

### Limites de taxa

A API do Google Indexing tem limites de taxa. O robô espera 1 segundo entre cada solicitação para evitar atingir esses limites. Para sites grandes, considere aumentar esse intervalo ou executar a indexação em lotes menores.

## Arquivos do Projeto

- `robo_indexacao.py`: O script principal que realiza a indexação
- `indexacao.sh`: Script de shell para facilitar a execução
- `corrigir_env.py`: Script para corrigir o formato da chave privada no .env
- `corrigir_e_testar.sh`: Script para corrigir e testar todo o processo
- `verificar_credenciais.py`: Script gerado automaticamente para verificar as credenciais

## Integração com CI/CD

Para integração com sistemas de CI/CD, você pode usar o script `robo_indexacao.py` como parte do seu pipeline de implantação:

```yaml
deploy:
  steps:
    - name: Checkout code
      uses: actions/checkout@v2
    
    - name: Setup Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.10'
    
    - name: Install dependencies
      run: pip install requests google-auth google-api-python-client python-dotenv
    
    - name: Run indexing robot
      run: python scripts/robo_indexacao.py
      env:
        SITE_URL: ${{ secrets.SITE_URL }}
        GOOGLE_INDEXING_CLIENT_EMAIL: ${{ secrets.GOOGLE_INDEXING_CLIENT_EMAIL }}
        GOOGLE_INDEXING_PRIVATE_KEY: ${{ secrets.GOOGLE_INDEXING_PRIVATE_KEY }}
``` 