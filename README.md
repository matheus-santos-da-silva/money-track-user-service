# Money Track · users-service

[![CI](https://github.com/matheus-santos-da-silva/money-track-user-service/actions/workflows/ci.yml/badge.svg)](https://github.com/matheus-santos-da-silva/money-track-user-service/actions/workflows/ci.yml)

Serviço de contas do [Money Track](https://github.com/matheus-santos-da-silva/money-track), um app de finanças pessoais. É a fonte da verdade sobre o usuário e o plano dele: cadastro, login, perfil, trial, assinatura Google Play e exclusão de conta. Cada mudança relevante é publicada no Kafka para o [finance-service](https://github.com/matheus-santos-da-silva/money-track-finance-service).

**Stack:** NestJS · TypeScript · Prisma (PostgreSQL) · Kafka · JWT · class-validator · Throttler

## Responsabilidades

- Cadastro e login com JWT de 7 dias; edição de perfil e troca de senha
- Plano e trial: todo usuário nasce `FREE` com 7 dias de trial. O servidor calcula `isPremium` e `isTrialActive`; o app só consome
- Assinatura Google Play: a compra é validada na Play Developer API e cancelamentos chegam por webhook Pub/Sub
- Exclusão de conta mediante senha, propagada ao finance-service por evento

## Eventos publicados

| Tópico | Quando | Payload |
|---|---|---|
| `user-created` | cadastro | `{ id, plan, trialEndsAt }` |
| `user-plan-updated` | compra validada ou assinatura cancelada | `{ id, plan }` |
| `user-deleted` | exclusão de conta | `{ id }` |

## Endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/users` | — | Cadastro → `{ token }` |
| POST | `/users/signIn` | — | Login → `{ token }` |
| GET | `/users` | Bearer | Usuário logado, com `isPremium` e `isTrialActive` |
| PATCH | `/users/:id` | Bearer | Atualiza nome e/ou e-mail |
| PATCH | `/users/:id/password` | Bearer | Troca de senha |
| DELETE | `/users/:id` | Bearer | Exclui a conta (exige senha) |
| POST | `/subscriptions/validate` | Bearer | Valida uma compra da Google Play |
| POST | `/subscriptions/webhook/google-play` | Token fixo | Notificações Pub/Sub da Google |

## Arquitetura

Clean Architecture: os controllers dependem de contratos (`use-cases-protocol`) e o Nest injeta a implementação concreta.

```
src/
├── presentation/controllers/   endpoints REST
├── application/
│   ├── auth/                   AuthGuard (JWT)
│   └── use-cases/              uma classe por operação
├── domain/                     DTOs, entidades e contratos
├── infra/
│   ├── database/               Prisma e repositórios
│   ├── kafka/                  producers
│   └── store-api/              Google Play Developer API
└── shared/utils/
```

## Rodando

O jeito mais simples é subir a stack inteira pelo [repositório principal](https://github.com/matheus-santos-da-silva/money-track) (Kafka, bancos e os dois serviços com um `docker compose`).

Para rodar só este serviço na máquina, com Kafka e Postgres já de pé:

```bash
cp .env.example .env      # DATABASE_URL, JWT_SECRET, KAFKA_URL
yarn install
yarn prisma generate
npx prisma migrate deploy
yarn start:dev
```

`JWT_SECRET` precisa ser idêntico ao do finance-service. As variáveis da Google Play são opcionais em desenvolvimento; sem elas, só a validação de compras falha.

## Testes

```bash
yarn test:unit     # unitários
yarn test:e2e      # e2e: precisa de um Postgres com as credenciais de .env.testing
```

Cada execução e2e cria e remove um schema `test_<uuid>` isolado.
