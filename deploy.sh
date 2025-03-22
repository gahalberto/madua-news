#!/bin/bash

# Atualiza o código
git pull

# Instala as dependências
npm install

# Aplica as migrações do banco de dados
npx prisma migrate deploy

# Gera o Prisma Client
npx prisma generate

# Reinicia o servidor
pm2 restart all

echo "Deploy concluído com sucesso!" 