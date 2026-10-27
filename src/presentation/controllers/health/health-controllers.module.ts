import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { KafkaHealthIndicator } from "src/infra/health/kafka.health";
import { PrismaModule } from "src/infra/database/config/prisma.module";

@Module({
  imports: [TerminusModule, PrismaModule],
  controllers: [HealthController],
  providers: [KafkaHealthIndicator],
})
export class HealthControllersModule {}
