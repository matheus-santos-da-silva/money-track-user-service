import { Request, Response } from "express";
import { Producer } from "@nestjs/microservices/external/kafka.interface";
import { kafkaProducerMock } from "../mocks/kafka-mock";
import {
  CORRELATION_ID_HEADER,
  KafkaProducerService,
} from "src/infra/kafka/producers/kafka-producer.service";
import {
  getRequestContext,
  REQUEST_ID_HEADER,
  requestContextMiddleware,
  runWithContext,
  setUserId,
} from "src/shared/observability/request-context";

// Executa o middleware e devolve o contexto visto "dentro" da requisição.
const runRequest = (requestIdHeader?: string) => {
  const req = { header: () => requestIdHeader } as unknown as Request;
  const res = { setHeader: jest.fn() } as unknown as Response;
  let seen: ReturnType<typeof getRequestContext>;

  requestContextMiddleware(req, res, () => {
    seen = getRequestContext();
  });

  return { req: req as Request & { id: string }, res, seen };
};

describe("request context", () => {
  it("should give each request an id, available only inside it", () => {
    const { req, res, seen } = runRequest();

    expect(seen?.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(req.id).toBe(seen?.requestId);
    expect(res.setHeader).toHaveBeenCalledWith(REQUEST_ID_HEADER, seen?.requestId);
    expect(getRequestContext()).toBeUndefined();
  });

  it("should reuse a valid x-request-id sent by the client", () => {
    expect(runRequest("app-123").seen?.requestId).toBe("app-123");
  });

  it("should ignore an x-request-id that could inject text in the logs", () => {
    const { seen } = runRequest('falso"\n{"level":"error"}');

    expect(seen?.requestId).not.toContain("falso");
  });

  it("should add the user once the token is validated", () => {
    runWithContext({ requestId: "req-1" }, () => {
      setUserId("user-1");
      expect(getRequestContext()).toEqual({ requestId: "req-1", userId: "user-1" });
    });
  });
});

describe("KafkaProducerService", () => {
  beforeEach(() => jest.clearAllMocks());

  const lastMessage = () =>
    (kafkaProducerMock.send as jest.Mock).mock.calls[0][0].messages[0];

  it("should send the current request id as the correlation header", async () => {
    const service = new KafkaProducerService(kafkaProducerMock as Producer);

    await runWithContext({ requestId: "req-42" }, () =>
      service.send({ topic: "user-created", key: "user-created", value: { id: "1" } }),
    );

    expect(lastMessage().headers).toEqual({ [CORRELATION_ID_HEADER]: "req-42" });
  });

  it("should still send a correlation id outside a request", async () => {
    const service = new KafkaProducerService(kafkaProducerMock as Producer);

    await service.send({ topic: "user-deleted", key: "user-deleted", value: { id: "1" } });

    expect(lastMessage().headers[CORRELATION_ID_HEADER]).toMatch(/^[0-9a-f-]{36}$/);
  });
});
