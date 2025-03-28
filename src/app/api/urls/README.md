# API de URLs de Conteúdo

Esta API fornece uma lista completa de URLs para todos os tipos de conteúdo disponíveis no site Madua.

## Endpoint

```
GET /api/urls
```

## Parâmetros de consulta

A API suporta os seguintes parâmetros opcionais:

| Parâmetro | Descrição | Exemplo |
|-----------|-----------|---------|
| tipo | Filtra por tipo de conteúdo (cursos, ebooks, produtos, posts) | `?tipo=posts` |
| limite | Número máximo de itens a retornar | `?limite=10` |

### Exemplos de uso

- Listar todas as URLs: `/api/urls`
- Listar apenas cursos: `/api/urls?tipo=cursos`
- Listar os 5 primeiros ebooks: `/api/urls?tipo=ebooks&limite=5`

## Resposta

A API retorna um objeto JSON contendo listas de URLs para cada tipo de conteúdo solicitado:

```json
{
  "cursos": ["https://madua.com.br/cursos/curso1", "https://madua.com.br/cursos/curso2"],
  "ebooks": ["https://madua.com.br/ebooks/ebook1", "https://madua.com.br/ebooks/ebook2"],
  "produtos": ["https://madua.com.br/produtos/produto1", "https://madua.com.br/produtos/produto2"],
  "posts": ["https://madua.com.br/posts/post1", "https://madua.com.br/posts/post2"],
  "meta": {
    "total": 8,
    "filtro": "todos",
    "limite": "sem limite",
    "basePath": "https://madua.com.br"
  }
}
```

Quando o parâmetro `tipo` é utilizado, apenas o tipo especificado é retornado:

```json
{
  "posts": ["https://madua.com.br/posts/post1", "https://madua.com.br/posts/post2"],
  "meta": {
    "total": 2,
    "filtro": "posts",
    "limite": "sem limite",
    "basePath": "https://madua.com.br"
  }
}
```

## Metadados

O objeto `meta` na resposta contém informações adicionais sobre a consulta:

- `total`: Total de URLs retornadas
- `filtro`: Tipo de conteúdo filtrado (ou "todos" se nenhum filtro for aplicado)
- `limite`: Valor do limite aplicado (ou "sem limite" se nenhum limite for especificado)
- `basePath`: URL base utilizada para construir as URLs completas

## Uso

Esta API pode ser usada para:

1. Gerar sitemaps para SEO
2. Indexar o conteúdo em serviços de busca
3. Compartilhar links de conteúdo com parceiros
4. Monitorar a quantidade de conteúdo publicado

## Filtros

Por padrão, a API retorna apenas conteúdo publicado. Cursos e ebooks com status `isPublished: false` e posts com status `published: false` não são incluídos na resposta.

## Considerações Técnicas

- A API acessa diretamente o banco de dados PostgreSQL através do Prisma ORM
- A conexão ao banco de dados é fechada após cada requisição para evitar vazamento de recursos
- Erros são tratados e retornam um status 500 com mensagem de erro
- A API é escalável e se adaptará automaticamente à medida que novos conteúdos forem adicionados ao site 