import { Request, Response } from "express";
import { Producer } from "@nestjs/microservices/external/kafka.interface";
import { kafkaProducerMock } from "../mocks/kafka-mock";
import { setupInMemoryTracing } from "../helpers/in-memory-tracing";
import { isInternalPath } from "src/shared/observability/internal-paths";
import { KafkaProducerService } from "src/infra/kafka/producers/kafka-producer.service";
import {
  getRequestContext,
  REQUEST_ID_HEADER,
  requestContextMiddleware,
  setUserId,
} from "src/shared/observability/request-context";

const { exporter, tracer } = setupInMemoryTracing();

// Executa o middleware e devolve o contexto visto "dentro" da requisição.
const runRequest = (inside: () => void = () => undefined) => {
  const res = { setHeader: jest.fn() } as unknown as Response;
  let seen: ReturnType<typeof getRequestContext>;

  requestContextMiddleware({} as Request, res, () => {
    inside();
    seen = getRequestContext();
  });

  return { res, seen };
};

describe("request context", () => {
  beforeEach(() => exporter.reset());

  it("should return the trace id as x-request-id", () => {
    tracer.startActiveSpan("POST /users", (span) => {
      const { res } = runRequest();

      expect(res.setHeader).toHaveBeenCalledWith(
        REQUEST_ID_HEADER,
        span.spanContext().traceId,
      );
      span.end();
    });
  });

  it("should not set the header outside a trace", () => {
    expect(runRequest().res.setHeader).not.toHaveBeenCalled();
  });

  it("should keep the user only inside the request", () => {
    const { seen } = runRequest(() => setUserId("user-1"));

    expect(seen).toEqual({ userId: "user-1" });
    expect(getRequestContext()).toBeUndefined();
  });

  it("should record the user in the span", () => {
    tracer.startActiveSpan("GET /users/:id", (span) => {
      runRequest(() => setUserId("user-1"));
      span.end();
    });

    expect(exporter.getFinishedSpans()[0].attributes["enduser.id"]).toBe("user-1");
  });
});

describe("isInternalPath", () => {
  it("should match the health endpoints only", () => {
    expect(isInternalPath("/health/ready")).toBe(true);
    expect(isInternalPath("/health/live")).toBe(true);
    expect(isInternalPath("/users/signIn")).toBe(false);
    expect(isInternalPath(undefined)).toBe(false);
  });
});

describe("KafkaProducerService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should publish the event as JSON with its key", async () => {
    const service = new KafkaProducerService(kafkaProducerMock as Producer);

    await service.send({ topic: "user-created", key: "user-created", value: { id: "1" } });

    expect(kafkaProducerMock.send).toHaveBeenCalledWith({
      topic: "user-created",
      messages: [{ key: "user-created", value: '{"id":"1"}' }],
    });
  });
});
