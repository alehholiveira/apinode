# Projeto API Node com Fastify e PostgreSQL

Este projeto é uma API desenvolvida com Fastify e TypeScript, utilizando o Prisma como ORM para interagir com um banco de dados PostgreSQL. A aplicação permite listar e criar usuários, com validação de dados utilizando Zod.
Além disso, as rotas desenvolvidas possuem autodocumentação, utilizando o fastify-swagger.

## Estrutura do Projeto

- **prisma/schema.prisma**: Define o esquema do Prisma e a fonte de dados.
- **src/routes.ts**: Contém as rotas da aplicação para gerenciar usuários.
- **src/server.ts**: Ponto de entrada da aplicação, configura o servidor Fastify.
- **src/types.ts**: Define tipos personalizados para a instância do Fastify.
- **.env**: Contém variáveis de ambiente, incluindo a URL de conexão do banco de dados.
- **.gitignore**: Especifica arquivos e pastas a serem ignorados pelo Git.
- **compose.yml**: Configuração para executar o banco de dados PostgreSQL em um contêiner Docker.
- **Dockerfile**: Instruções para construir a imagem Docker da aplicação.
- **package.json**: Configuração do npm, listando dependências e scripts do projeto.
- **tsconfig.json**: Configuração do TypeScript.

## Execução

1. Certifique-se de ter o Docker e o Docker Compose instalados.
2. Execute `docker-compose up` para iniciar o banco de dados PostgreSQL.
3. Rode a migration disponivel com o comando `npx prisma migrate dev`
4. Inicie a aplicação com `npm run dev`.

Agora a API está rodando em `http://localhost:3333`.
Você pode acessar e testar as rotas disponiveis em: `http://localhost:3333/docs`
