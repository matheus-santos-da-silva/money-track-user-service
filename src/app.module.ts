import { Module, OnApplicationShutdown } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./application/auth/auth.module";
import { UsersControllersModule } from "./presentation/controllers/users-controllers.module";
import { HealthControllersModule } from "./presentation/controllers/health/health-controllers.module";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { loggerOptions } from "./shared/observability/logger-options";
import { shutdownTelemetry } from "./shared/observability/telemetry";

@Module({
  imports: [
    LoggerModule.forRoot(loggerOptions("users-service")),
    UsersControllersModule,
    HealthControllersModule,
    AuthModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements OnApplicationShutdown {
  // Envia os spans e as métricas que ainda estão no buffer antes de o processo sair.
  onApplicationShutdown(): Promise<void> {
    return shutdownTelemetry();
  }
}
