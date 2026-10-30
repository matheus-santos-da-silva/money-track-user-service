import { Producer } from "@nestjs/microservices/external/kafka.interface";
import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";

export interface KafkaSendProps<T = any> {
  topic: string;
  key: string;
  value: T;
}

// A instrumentação do kafkajs injeta o header traceparent (leva o trace até o consumer)
// e mede os envios e as falhas (messaging.client.sent.messages).
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
    await this.kafkaProducer.send({
      topic: topic,
      messages: [{ key, value: JSON.stringify({ ...value }) }],
    });

    this.logger.debug({ topic }, "Evento publicado");
  }
}
