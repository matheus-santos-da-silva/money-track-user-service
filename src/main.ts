// Primeiro import: o tracing precisa instrumentar http, express, pg e kafkajs antes de eles serem carregados.
import "./instrument";
import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { requestContextMiddleware } from "./shared/observability/request-context";
import { configureMetrics, metricsMiddleware } from "./shared/observability/metrics";

async function bootstrap() {
  configureMetrics("users-service");
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  // Primeiro middleware: devolve o trace_id no x-request-id e abre o contexto do usuário para os logs.
  app.use(requestContextMiddleware);
  app.use(metricsMiddleware);
  app.enableShutdownHooks();
  // Atrás do Caddy, req.ip precisa ser o IP real do cliente (X-Forwarded-For);
  // senão o rate limit (Throttler) conta todos os usuários como um só.
  app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS ?? 1));
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Só produz eventos no Kafka (via ClientKafka em UsersUseCasesModule); não há
  // consumers, então nenhum servidor de microservice é conectado aqui.
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
