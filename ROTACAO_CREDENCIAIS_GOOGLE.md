# Rotação de Credenciais da API Google

## ATENÇÃO: SUAS CREDENCIAIS ATUAIS FORAM EXPOSTAS!

As credenciais da conta de serviço do Google Cloud associadas ao projeto Madua foram expostas e **precisam ser regeneradas imediatamente**.

## Passos para regenerar as chaves:

1. Acesse o [Console do Google Cloud](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Selecione o projeto `madua-454823`
3. Clique na conta de serviço `madua-user@madua-454823.iam.gserviceaccount.com`
4. Na seção "Chaves", clique em "Adicionar Chave" > "Criar nova chave"
5. Selecione o formato JSON e clique em "Criar"
6. Salve o arquivo JSON em um local seguro
7. **Importante:** Revogue/exclua a chave antiga após confirmar que a nova funciona

## Atualização das credenciais no ambiente

1. Abra o arquivo `.env` no servidor
2. Atualize os valores das seguintes variáveis:
   ```
   GOOGLE_INDEXING_CLIENT_EMAIL=madua-user@madua-454823.iam.gserviceaccount.com
   GOOGLE_INDEXING_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
3. Substitua o valor de `GOOGLE_INDEXING_PRIVATE_KEY` pelo conteúdo da nova chave
4. Reinicie os serviços que utilizam essas credenciais

## Verificação

Após atualizar as credenciais, execute o comando abaixo para verificar se a nova configuração está funcionando:

```bash
npm run indexing:debug
```

Se o comando for executado com sucesso, suas novas credenciais estão funcionando corretamente.

## Medidas de segurança adicionais

- Nunca compartilhe ou exponha as chaves privadas em repositórios git
- Verifique se o arquivo `.env` está no `.gitignore`
- Considere usar um gerenciador de segredos para armazenar credenciais em produção
- Faça rotação das chaves periodicamente, mesmo sem exposição 