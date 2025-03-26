# Configuração da API do Instagram

Este documento explica como configurar corretamente a API do Instagram para publicar posts diretamente do seu painel administrativo.

## Pré-requisitos

1. Uma conta comercial do Instagram
2. Uma página do Facebook associada à sua conta do Instagram
3. Uma conta de desenvolvedor do Facebook

## Passos para configuração

### 1. Crie uma conta de desenvolvedor do Facebook

Se você ainda não tem uma conta de desenvolvedor:
- Acesse [developers.facebook.com](https://developers.facebook.com/)
- Faça login com sua conta do Facebook (a mesma associada à sua conta comercial do Instagram)
- Siga as instruções para criar uma conta de desenvolvedor

### 2. Crie um aplicativo do Facebook

- No painel de desenvolvedor, clique em "Criar aplicativo"
- Selecione o tipo "Consumidor" ou "Negócios"
- Preencha os detalhes do aplicativo (nome, e-mail de contato, etc.)
- Na seção "Adicionar produtos ao seu aplicativo", localize e adicione "Instagram Graph API"

### 3. Configure as permissões necessárias

- No painel do seu aplicativo, vá para "Configurações" > "Básico"
- Adicione seu site à lista de URLs permitidas no campo "Domínios do site"
- Vá para a seção "Instagram Graph API" ou "Produtos" > "Instagram"
- Adicione a conta do Instagram que você deseja usar
- Solicite as seguintes permissões:
  - `instagram_basic` - Para acesso básico à API
  - `instagram_content_publish` - Para publicar conteúdo
  - `pages_show_list` - Para ver suas páginas do Facebook
  - `pages_read_engagement` - Para ler informações da página

### 4. Gerar token de acesso

- No painel do aplicativo, vá para "Ferramentas" > "Graph API Explorer"
- No menu suspenso de aplicativos, selecione seu aplicativo
- No menu suspenso "Token de acesso do usuário", selecione a página do Facebook associada à sua conta do Instagram
- Clique em "Gerar token de acesso"
- Certifique-se de que as permissões necessárias estejam selecionadas
- Clique em "Gerar token"

### 5. Converter para um token de longa duração

Os tokens normais expiram em cerca de 2 horas. Para obter um token de longa duração (60 dias), faça o seguinte:

```
https://graph.facebook.com/v20.0/oauth/access_token?
  grant_type=fb_exchange_token&
  client_id={app-id}&
  client_secret={app-secret}&
  fb_exchange_token={token-curto}
```

Substitua:
- `{app-id}` pelo ID do seu aplicativo
- `{app-secret}` pelo segredo do aplicativo (encontrado em Configurações > Básico)
- `{token-curto}` pelo token que você gerou no passo anterior

### 6. Obter o Instagram User ID

Para obter seu Instagram User ID, use o seguinte endpoint:

```
https://graph.facebook.com/v20.0/me/accounts?access_token={seu-token}
```

Isso retornará as páginas associadas à sua conta. Anote o ID da página associada à sua conta do Instagram.

Em seguida, use este endpoint:

```
https://graph.facebook.com/v20.0/{page-id}?fields=instagram_business_account&access_token={seu-token}
```

A resposta incluirá o `instagram_business_account.id` - este é o seu Instagram User ID.

### 7. Configure as variáveis de ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```
INSTAGRAM_ACCESS_TOKEN=seu_token_de_acesso_de_longa_duracao
INSTAGRAM_USER_ID=seu_instagram_user_id
```

## Solução de problemas comuns

### Erro "Unexpected token 'S', "Sorry, thi"... is not valid JSON"

Este erro geralmente indica um problema com a autenticação ou a URL da imagem. Verifique:

1. **Token de acesso inválido ou expirado**: Gere um novo token de acesso e converta-o para um token de longa duração.

2. **URL da imagem inacessível**: A API do Instagram só pode acessar imagens em URLs públicas acessíveis pela internet. 
   - Certifique-se de que a URL da imagem é pública e pode ser acessada diretamente em um navegador.
   - Teste a URL em uma janela anônima/incógnito do navegador.
   - A URL deve começar com `https://` (não `http://`).
   - Não pode ser um blob ou URL de arquivo local.

3. **Formato de imagem incompatível**: A API do Instagram suporta apenas formatos JPEG e PNG.

4. **Tamanho de imagem inadequado**: A imagem deve ter pelo menos 320px de largura. Imagens muito grandes também podem ser rejeitadas.

### Erro "Application does not have permission to publish content"

Este erro ocorre quando:
- Seu aplicativo não tem a permissão `instagram_content_publish`
- A conta do Instagram não está configurada como conta comercial
- A conta do Instagram não está conectada à sua página do Facebook

### Erro "Media cannot be found or media owner does not match user"

Este erro ocorre quando:
- A URL da imagem não está acessível
- Há problemas de CORS/acesso com a URL da imagem

## Recursos adicionais

- [Documentação oficial da Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Guia de publicação de conteúdo](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)
- [Ferramenta para testar tokens](https://developers.facebook.com/tools/debug/accesstoken/) 