# Plataforma de Cursos Online

Uma plataforma educacional completa desenvolvida com Next.js e Prisma, inspirada no design do [Luma](https://luma.humatheme.com/Demos/Fixed_Layout/index.html).

## Funcionalidades

- **Sistema de Autenticação**: Registro, login e recuperação de senha
- **Cursos Online**: Criação, visualização e gerenciamento de cursos
- **Dashboard de Aluno**: Acompanhamento de progresso, certificados e tarefas
- **Dashboard de Professor**: Gerenciamento de cursos, alunos e conteúdo
- **Blog**: Publicação e gerenciamento de artigos
- **E-commerce**: Venda de produtos educacionais
- **Gerenciamento de Tarefas**: Criação e acompanhamento de tarefas
- **Gerenciamento de Projetos**: Organização de projetos e equipes

## Tecnologias Utilizadas

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL com Prisma ORM (via Docker)
- **Autenticação**: NextAuth.js
- **Validação**: Zod
- **Formulários**: React Hook Form
- **Requisições HTTP**: Axios
- **Containerização**: Docker e Docker Compose

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/           # Rotas de autenticação
│   ├── (dashboard)/      # Rotas do dashboard
│   ├── (marketing)/      # Rotas públicas
│   ├── api/              # API Routes
│   └── ...
├── components/
│   ├── ui/               # Componentes de UI
│   ├── forms/            # Componentes de formulários
│   └── ...
├── lib/
│   ├── prisma/           # Cliente Prisma
│   └── ...
├── hooks/                # Custom hooks
└── ...
```

## Modelos de Dados

- **User**: Usuários do sistema (alunos, professores, administradores)
- **Course**: Cursos disponíveis na plataforma
- **Chapter**: Capítulos/aulas de cada curso
- **Enrollment**: Matrículas dos alunos nos cursos
- **Progress**: Progresso dos alunos em cada capítulo
- **Review**: Avaliações dos cursos
- **Post**: Artigos do blog
- **Comment**: Comentários nos artigos
- **Product**: Produtos para venda
- **Order**: Pedidos de compra
- **Task**: Tarefas
- **Project**: Projetos

## Instalação e Execução

### Pré-requisitos

- Node.js (v18+)
- Docker e Docker Compose

### Configuração

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/plataforma-de-curso.git
   cd plataforma-de-curso
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis necessárias

4. Inicie o banco de dados PostgreSQL com Docker:
   ```bash
   npm run db:start
   ```

5. Configure o banco de dados:
   ```bash
   npm run db:migrate
   ```

6. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

7. Acesse a aplicação em `http://localhost:3000`

### Gerenciamento do Banco de Dados

Para mais detalhes sobre como gerenciar o banco de dados PostgreSQL com Docker, consulte o arquivo [DATABASE.md](DATABASE.md).

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
