# Instruções para Resolver Problemas de Build

Este documento contém instruções para resolver problemas comuns durante o processo de build do projeto Madua.

## Erro: Cannot find module 'critters'

Se você encontrar o erro "Cannot find module 'critters'" durante o build, siga as instruções abaixo:

### Solução 1: Instalar o pacote critters

```bash
# No diretório do projeto
npm install critters --no-save
```

O `--no-save` evita modificar o package.json, o que é útil em ambientes de produção.

### Solução 2: Desativar a otimização de CSS

Se a Solução 1 não funcionar, você pode desativar a otimização de CSS no `next.config.js`:

```js
// next.config.js
module.exports = {
  // ... outras configurações
  experimental: {
    optimizeCss: false, // Desativar a otimização de CSS
    // ... outras configurações experimentais
  },
};
```

### Solução 3: Usar o módulo alternativo

Se você não conseguir instalar o critters e precisar manter a otimização de CSS, você pode usar o módulo alternativo incluído no projeto:

1. Crie uma pasta em `/var/www/madua/node_modules/critters` (se não existir)
2. Copie o arquivo `critters-alternative.js` para `/var/www/madua/node_modules/critters/index.js`

```bash
mkdir -p /var/www/madua/node_modules/critters
cp /var/www/madua/critters-alternative.js /var/www/madua/node_modules/critters/index.js
```

## Erro: Unrecognized key(s) in object: 'swcMinify'

Este erro ocorre porque a opção `swcMinify` não é mais reconhecida na versão do Next.js que você está usando.

### Solução

Remova a opção `swcMinify` do seu `next.config.js`. O Next.js agora usa SWC para minificação por padrão, então não é necessário configurá-lo explicitamente.

## Erro durante a pré-renderização da página "/404"

Se você encontrar erros durante a pré-renderização da página 404, isso geralmente está relacionado à configuração ou a dependências faltando.

### Solução

1. Verifique se todas as dependências necessárias estão instaladas
2. Tente executar o build com a flag `--no-lint`:

```bash
npm run build -- --no-lint
```

## Outras soluções úteis

### Limpando o cache do Next.js

```bash
# Remova a pasta .next
rm -rf .next
# Execute o build novamente
npm run build
```

### Atualizando o Next.js para resolver problemas de compatibilidade

```bash
npm install next@latest react@latest react-dom@latest
```

### Verificando o ambiente Node.js

Certifique-se de que você está usando uma versão compatível do Node.js:

```bash
node -v
```

O Next.js 15.x requer Node.js 18.17 ou superior. 