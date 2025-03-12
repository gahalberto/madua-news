# Configuração do Banco de Dados PostgreSQL com Docker

Este projeto utiliza PostgreSQL como banco de dados, configurado através do Docker para facilitar o desenvolvimento.

## Pré-requisitos

- Docker e Docker Compose instalados na sua máquina

## Configuração Inicial

O arquivo `docker-compose.yml` na raiz do projeto contém a configuração necessária para executar o PostgreSQL em um contêiner Docker.

## Comandos Disponíveis

Adicionamos scripts no `package.json` para facilitar o gerenciamento do banco de dados:

```bash
# Iniciar o contêiner PostgreSQL
npm run db:start

# Parar o contêiner PostgreSQL
npm run db:stop

# Abrir o Prisma Studio (interface gráfica para o banco de dados)
npm run db:studio

# Executar migrações do Prisma
npm run db:migrate

# Resetar o banco de dados (cuidado: apaga todos os dados)
npm run db:reset
```

## Detalhes da Configuração

- **Porta**: 5432 (padrão do PostgreSQL)
- **Usuário**: postgres
- **Senha**: postgres
- **Nome do Banco**: plataforma_cursos
- **Contêiner**: plataforma_cursos_db

## Conexão Direta ao PostgreSQL

Se precisar se conectar diretamente ao PostgreSQL:

```bash
# Usando psql no contêiner
docker exec -it plataforma_cursos_db psql -U postgres -d plataforma_cursos

# Ou usando uma ferramenta externa com estas credenciais:
# Host: localhost
# Port: 5432
# User: postgres
# Password: postgres
# Database: plataforma_cursos
```

## Persistência de Dados

Os dados do PostgreSQL são persistidos em um volume Docker chamado `postgres_data`, o que significa que seus dados não serão perdidos quando o contêiner for reiniciado.

## Solução de Problemas

Se encontrar problemas com o banco de dados:

1. Verifique se o contêiner está em execução: `docker ps`
2. Verifique os logs do contêiner: `docker logs plataforma_cursos_db`
3. Reinicie o contêiner: `npm run db:stop && npm run db:start`
4. Se necessário, reset o banco de dados: `npm run db:reset` (cuidado: isso apaga todos os dados) 