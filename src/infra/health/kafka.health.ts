import { Admin, Kafka, logLevel } from "kafkajs";
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { HealthIndicatorResult, HealthIndicatorService } from "@nestjs/terminus";

const DEFAULT_TIMEOUT_MS = 1500;

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`sem resposta em ${ms} ms`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });

// A conexão é reaproveitada entre as checagens e descartada quando uma falha.
@Injectable()
export class KafkaHealthIndicator implements OnModuleDestroy {
  private admin?: Admin;
  private connecting?: Promise<Admin>;

  constructor(private readonly healthIndicatorService: HealthIndicatorService) {}

  async isHealthy(
    key: string,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  ): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      const { brokers } = await withTimeout(
        this.getAdmin().then((admin) => admin.describeCluster()),
        timeoutMs,
      );
      return indicator.up({ brokers: brokers.length });
    } catch (error) {
      await this.reset();
      const message = error instanceof Error ? error.message : String(error);
      return indicator.down({ message });
    }
  }

  async onModuleDestroy() {
    await this.reset();
  }

  protected createAdmin(): Admin {
    return new Kafka({
      clientId: "health-check",
      brokers: [process.env.KAFKA_URL],
      logLevel: logLevel.NOTHING,
      connectionTimeout: 1000,
      requestTimeout: DEFAULT_TIMEOUT_MS,
      retry: { retries: 0 },
    }).admin();
  }

  private getAdmin(): Promise<Admin> {
    if (this.admin) return Promise.resolve(this.admin);

    this.connecting ??= (async () => {
      const admin = this.createAdmin();
      await admin.connect();
      this.admin = admin;
      return admin;
    })().finally(() => {
      this.connecting = undefined;
    });

    return this.connecting;
  }

  private async reset() {
    const admin = this.admin;
    this.admin = undefined;
    await admin?.disconnect().catch(() => undefined);
  }
}
