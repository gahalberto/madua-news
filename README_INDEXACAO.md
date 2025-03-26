# Sistema de Indexação do Google para Madua

Este sistema permite a indexação automática de páginas do site Madua na Pesquisa Google, utilizando a API de Indexação do Google.

## Visão Geral

O sistema é composto por:

1. **Biblioteca de Indexação** (`src/lib/googleIndexing.ts`)
   - Funções para autenticação e envio de URLs para a API do Google
   
2. **API REST** (`src/app/api/indexing/route.ts`) 
   - Endpoint para acionar a indexação via HTTP

3. **Script de Automação** (`src/scripts/indexing-cron.ts`)
   - Script para ser executado via cron job nos horários específicos

4. **Script de Conveniência** (`scripts/indexing.sh`)
   - Script shell para facilitar a execução via cron

## Pré-requisitos

1. Conta Google com acesso ao Google Search Console
2. Verificação de propriedade do site no Google Search Console
3. Projeto configurado no Google Cloud Platform
4. Conta de serviço com permissões para a API de Indexação

## Configuração

### 1. Criar um projeto no Google Cloud Platform

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative a "Indexing API" em "APIs e Serviços"
4. Crie uma conta de serviço com permissões para a API de Indexação
5. Gere e baixe uma chave JSON para a conta de serviço

### 2. Configurar as credenciais no ambiente

Adicione as seguintes variáveis ao arquivo `.env` do projeto:

```
# Credenciais para API de Indexação do Google
GOOGLE_INDEXING_CLIENT_EMAIL=sua-conta-de-servico@seu-projeto.iam.gserviceaccount.com
GOOGLE_INDEXING_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSuaChavePrivada\n-----END PRIVATE KEY-----\n"

# Chave para proteção do endpoint da API (opcional)
INDEXING_API_KEY=chave-secreta-para-acesso-api
```

### 3. Verificar a propriedade no Google Search Console

1. Acesse o [Google Search Console](https://search.google.com/search-console)
2. Adicione sua propriedade (site) se ainda não estiver adicionada
3. Verifique a propriedade seguindo as instruções do Google
4. Na configuração da propriedade, adicione a conta de serviço criada como usuário com permissões de Proprietário

## ⚠️ Segurança das Credenciais

**ATENÇÃO:** As credenciais do Google Cloud são sensíveis e devem ser protegidas:

1. **NUNCA compartilhe** as chaves privadas em repositórios Git, mesmo privados
2. Adicione `.env` ao arquivo `.gitignore` para evitar commits acidentais
3. Em ambientes de produção, use variáveis de ambiente seguras ou armazenamentos de segredos
4. Considere a rotação periódica das chaves para maior segurança
5. Limite as permissões da conta de serviço apenas ao essencial

Se você suspeitar que suas credenciais foram expostas, revogue-as imediatamente e gere novas chaves no Console do Google Cloud.

## Utilização

### Executar indexação manualmente

```bash
# Via npm script
npm run indexing

# Via script diretamente (para debug)
npm run indexing:debug
```

### Configurar cron job para execução automática

Para configurar a execução automática nos horários especificados (9:00, 12:00, 15:00, 18:00 e 21:00), adicione a seguinte linha ao crontab:

```
0 9,12,15,18,21 * * * cd /caminho/completo/para/projeto && bash scripts/indexing.sh >> /var/log/indexing.log 2>&1
```

Para editar o crontab:

```bash
crontab -e
```

### Usar a API REST

A API pode ser acessada via POST para `/api/indexing`:

```bash
# Exemplo com curl
curl -X POST https://seu-site.com/api/indexing \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua-chave-api" \
  -d '{"limit": 10}'
```

#### Parâmetros da API:

- `limit`: Número de URLs recentes a serem indexadas (padrão: 10)
- `urls`: Array de URLs específicas para indexar (opcional)
- `action`: Ação de indexação ('URL_UPDATED' ou 'URL_DELETED', padrão: 'URL_UPDATED')

## Limites e cotas

A API de Indexação do Google possui as seguintes limitações:

- Máximo de 200 solicitações por dia para sites pequenos
- Máximo de 600 solicitações por dia para sites maiores
- Limites adicionais por minuto (entre 2 e 10 solicitações)

O script é projetado para respeitar esses limites, incluindo pausas entre solicitações.

## Solução de Problemas

### Logs

Os logs são gerados no console durante a execução do script. Se configurado com o crontab conforme sugerido, os logs serão salvos em `/var/log/indexing.log`.

### Erros comuns

1. **Credenciais inválidas**: Verifique se as credenciais estão configuradas corretamente no arquivo `.env`.

2. **URL não encontrada**: A API retornará erro se uma URL não existir. Verifique se a URL é válida e acessível.

3. **Cota excedida**: Se o limite de solicitações for atingido, a API retornará um erro. Ajuste a frequência ou o número de URLs por execução.

4. **Falha na verificação do domínio**: Certifique-se de que a conta de serviço foi adicionada como proprietária no Search Console.

## Recomendações

1. **Priorização**: Priorize URLs novas ou atualizações importantes.

2. **Monitoramento**: Monitore o Google Search Console para verificar se as URLs estão sendo indexadas corretamente.

3. **Sitemaps**: Mantenha seu sitemap atualizado, além de usar a API de Indexação.

4. **Conteúdo de qualidade**: A API apenas solicita indexação, não garante que o conteúdo será indexado. Mantenha o conteúdo de alta qualidade.

---

Para mais informações, consulte a [documentação oficial da API de Indexação do Google](https://developers.google.com/search/apis/indexing-api/v3/quickstart). 