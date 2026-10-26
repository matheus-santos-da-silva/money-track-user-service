import { Logger } from "@nestjs/common";

// Unit tests não dependem de um .env: define apenas o que o código lê de process.env.
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "unit-test-secret";

// Os logs da aplicação não poluem a saída dos testes.
Logger.overrideLogger(false);
