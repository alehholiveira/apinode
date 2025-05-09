# API Node com Fastify, TypeScript e PostgreSQL

Este projeto é uma API RESTful desenvolvida em **Node.js** com **Fastify** e **TypeScript**, utilizando **Prisma ORM** para integração com banco de dados **PostgreSQL**. O projeto inclui autenticação JWT, validação de dados com Zod, envio de e-mails via SendGrid, integração com ThingSpeak para leitura de sensores e documentação automática com Swagger.

## Funcionalidades

- Cadastro e autenticação de usuários (JWT)
- Recuperação e redefinição de senha por e-mail
- Integração com ThingSpeak para leitura de dados de sensores [Aplicação que consumirá essa API](https://github.com/alehholiveira/uvbuddy)
- Rotas protegidas por autenticação
- Validação de dados com Zod
- Documentação automática via Swagger (`/docs`)
- Logs customizáveis com Pino

## Estrutura do Projeto

```
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── routes/
│   │   ├── routes.ts
│   │   └── uvbuddy.ts
│   ├── services/
│   │   └── uvbuddy-service.ts
│   ├── types.ts
│   └── server.ts
├── middleware/
│   └── auth.ts
├── .env.example
├── compose.yaml
├── package.json
├── tsconfig.json
└── README.md
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- [PostgreSQL](https://www.postgresql.org/) (ou use o Docker Compose incluso)

## Configuração

1. **Clone o repositório:**
   ```sh
   git clone <url-do-repositorio>
   cd apinode
   ```

2. **Configure as variáveis de ambiente:**
   - Copie `.env.example` para `.env` e preencha os valores necessários.

3. **Suba o banco de dados com Docker Compose:**
   ```sh
   docker-compose up -d
   ```

4. **Instale as dependências:**
   ```sh
   npm install
   ```

5. **Rode as migrations do Prisma:**
   ```sh
   npx prisma migrate dev
   ```

6. **Inicie a aplicação em modo desenvolvimento:**
   ```sh
   npm run dev
   ```

## Uso

- Acesse a documentação interativa em: [http://localhost:3333/docs](http://localhost:3333/docs)
- A API estará disponível em: [http://localhost:3333](http://localhost:3333)

## Principais Rotas

- `POST /register` — Cadastro de usuário
- `POST /login` — Login e geração de token JWT
- `POST /forgot-password` — Solicitação de recuperação de senha
- `POST /reset-password` — Redefinição de senha
- `GET /dados` — Rota protegida (JWT)
- `GET /sensor-data` — Dados do sensor ThingSpeak

## Observações

- O projeto utiliza logs customizados com Pino e Pino Pretty.
- As variáveis sensíveis (chaves, tokens, etc.) devem ser configuradas no arquivo `.env`.
- Para integração com ThingSpeak e envio de e-mails, configure as respectivas chaves no `.env`.

## Scripts

- `npx prisma migrate dev` — Executa as migrations do banco de dados.
- `npm run dev` — Inicia o servidor em modo desenvolvimento com recarregamento automático.

## Licença

Este projeto está sob a licença ISC.

---

Desenvolvido para fins acadêmicos.