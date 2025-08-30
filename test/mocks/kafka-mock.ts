import { Producer } from "@nestjs/microservices/external/kafka.interface";

export const kafkaProducerMock: Partial<Producer> = {
  connect: jest.fn().mockResolvedValue(undefined),
  send: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  sendBatch: jest.fn().mockResolvedValue(undefined),
  isIdempotent: jest.fn().mockReturnValue(false),
};
