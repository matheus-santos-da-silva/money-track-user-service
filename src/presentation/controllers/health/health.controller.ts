import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from "@nestjs/terminus";
import { KafkaHealthIndicator } from "src/infra/health/kafka.health";
import { PrismaService } from "src/infra/database/config/prisma.service";

const CHECK_TIMEOUT_MS = 1500;

@Controller("health")
@SkipThrottle()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly kafkaHealth: KafkaHealthIndicator,
  ) {}

  @Get("live")
  live() {
    return { status: "ok" };
  }

  @Get("ready")
  @HealthCheck()
  ready() {
    return this.health.check([
      () =>
        this.prismaHealth.pingCheck("database", this.prisma, {
          timeout: CHECK_TIMEOUT_MS,
        }),
      () => this.kafkaHealth.isHealthy("kafka", CHECK_TIMEOUT_MS),
    ]);
  }
}
