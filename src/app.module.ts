import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./application/auth/auth.module";
import { UsersControllersModule } from "./presentation/controllers/users-controllers.module";
import { HealthControllersModule } from "./presentation/controllers/health/health-controllers.module";
import { MetricsControllersModule } from "./presentation/controllers/metrics/metrics-controllers.module";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { loggerOptions } from "./shared/observability/logger-options";

@Module({
  imports: [
    LoggerModule.forRoot(loggerOptions("users-service")),
    UsersControllersModule,
    HealthControllersModule,
    MetricsControllersModule,
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
export class AppModule {}
