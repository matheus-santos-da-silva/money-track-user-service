import { Producer } from "@nestjs/microservices/external/kafka.interface";
import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { kafkaEventsPublishedTotal } from "src/shared/observability/business-metrics";

export interface KafkaSendProps<T = any> {
  topic: string;
  key: string;
  value: T;
}

// O header traceparent, que leva o trace até o consumer, é injetado pela instrumentação do kafkajs.
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
    try {
      await this.kafkaProducer.send({
        topic: topic,
        messages: [{ key, value: JSON.stringify({ ...value }) }],
      });
    } catch (error) {
      kafkaEventsPublishedTotal.inc({ topic, result: "error" });
      throw error;
    }

    kafkaEventsPublishedTotal.inc({ topic, result: "success" });
    this.logger.debug({ topic }, "Evento publicado");
  }
}
