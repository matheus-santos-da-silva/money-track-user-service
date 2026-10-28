import { randomUUID } from "node:crypto";
import { Producer } from "@nestjs/microservices/external/kafka.interface";
import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { getRequestContext } from "src/shared/observability/request-context";
import { kafkaEventsPublishedTotal } from "src/shared/observability/business-metrics";

// Header que leva o id da requisição de origem até quem consome o evento
export const CORRELATION_ID_HEADER = "x-correlation-id";

export interface KafkaSendProps<T = any> {
  topic: string;
  key: string;
  value: T;
}

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(
    @Inject("KAFKA_PRODUCER")
    private readonly kafkaProducer: Producer
  ) {}

  async onModuleInit() {
    await this.kafkaProducer.connect();
    this.logger.log("Kafka producer conectado");
  }

  async send<T = any>({ topic, key, value }: KafkaSendProps<T>) {
    const correlationId = getRequestContext()?.requestId ?? randomUUID();

    try {
      await this.kafkaProducer.send({
        topic: topic,
        messages: [
          {
            key,
            value: JSON.stringify({ ...value }),
            headers: { [CORRELATION_ID_HEADER]: correlationId },
          },
        ],
      });
    } catch (error) {
      kafkaEventsPublishedTotal.inc({ topic, result: "error" });
      throw error;
    }

    kafkaEventsPublishedTotal.inc({ topic, result: "success" });
    this.logger.debug({ topic, correlationId }, "Evento publicado");
  }
}
