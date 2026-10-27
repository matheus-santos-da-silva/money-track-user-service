import { Admin } from "kafkajs";
import { HealthCheckError, HealthCheckService } from "@nestjs/terminus";
import { KafkaHealthIndicator } from "src/infra/health/kafka.health";
import { HealthController } from "src/presentation/controllers/health/health.controller";

const fakeAdmin = (describeCluster: jest.Mock) =>
  ({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    describeCluster,
  }) as unknown as Admin & { connect: jest.Mock; disconnect: jest.Mock };

class TestKafkaHealthIndicator extends KafkaHealthIndicator {
  created: ReturnType<typeof fakeAdmin>[] = [];

  constructor(private readonly describeCluster: jest.Mock) {
    super();
  }

  protected createAdmin() {
    const admin = fakeAdmin(this.describeCluster);
    this.created.push(admin);
    return admin;
  }
}

describe("KafkaHealthIndicator", () => {
  it("should report up and reuse the same connection", async () => {
    const indicator = new TestKafkaHealthIndicator(
      jest.fn().mockResolvedValue({ brokers: [{}] }),
    );

    await expect(indicator.isHealthy("kafka")).resolves.toEqual({
      kafka: { status: "up", brokers: 1 },
    });
    await indicator.isHealthy("kafka");

    expect(indicator.created).toHaveLength(1);
  });

  it("should report down when the broker fails", async () => {
    const indicator = new TestKafkaHealthIndicator(
      jest.fn().mockRejectedValue(new Error("broker fora do ar")),
    );

    const error = await indicator.isHealthy("kafka").catch((e) => e);

    expect(error).toBeInstanceOf(HealthCheckError);
    expect(error.causes).toEqual({
      kafka: { status: "down", message: "broker fora do ar" },
    });
  });

  it("should report down when the broker does not answer in time", async () => {
    const indicator = new TestKafkaHealthIndicator(
      jest.fn().mockReturnValue(new Promise(() => undefined)),
    );

    const error = await indicator.isHealthy("kafka", 20).catch((e) => e);

    expect(error.causes.kafka).toEqual({
      status: "down",
      message: "sem resposta em 20 ms",
    });
  });

  it("should reconnect after a failure", async () => {
    const describeCluster = jest
      .fn()
      .mockRejectedValueOnce(new Error("broker fora do ar"))
      .mockResolvedValue({ brokers: [{}] });
    const indicator = new TestKafkaHealthIndicator(describeCluster);

    await indicator.isHealthy("kafka").catch(() => undefined);
    await expect(indicator.isHealthy("kafka")).resolves.toEqual({
      kafka: { status: "up", brokers: 1 },
    });

    expect(indicator.created).toHaveLength(2);
    expect(indicator.created[0].disconnect).toHaveBeenCalled();
  });
});

describe("HealthController", () => {
  const setup = () => {
    const health = { check: jest.fn((checks) => Promise.all(checks.map((c) => c()))) };
    const prismaHealth = { pingCheck: jest.fn().mockResolvedValue({ database: { status: "up" } }) };
    const kafkaHealth = { isHealthy: jest.fn().mockResolvedValue({ kafka: { status: "up" } }) };
    const controller = new HealthController(
      health as unknown as HealthCheckService,
      prismaHealth as never,
      {} as never,
      kafkaHealth as never,
    );
    return { controller, prismaHealth, kafkaHealth };
  };

  it("should answer live without touching the dependencies", () => {
    const { controller, prismaHealth, kafkaHealth } = setup();

    expect(controller.live()).toEqual({ status: "ok" });
    expect(prismaHealth.pingCheck).not.toHaveBeenCalled();
    expect(kafkaHealth.isHealthy).not.toHaveBeenCalled();
  });

  it("should check the database and Kafka when ready", async () => {
    const { controller, prismaHealth, kafkaHealth } = setup();

    await controller.ready();

    expect(prismaHealth.pingCheck).toHaveBeenCalledWith(
      "database",
      expect.anything(),
      { timeout: 1500 },
    );
    expect(kafkaHealth.isHealthy).toHaveBeenCalledWith("kafka", 1500);
  });
});
