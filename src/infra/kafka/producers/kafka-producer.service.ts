import { Producer } from "@nestjs/microservices/external/kafka.interface";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";

export interface KafkaSendProps<T = any> {
  topic: string;
  key: string;
  value: T;
}

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  constructor(
    @Inject("KAFKA_PRODUCER")
    private readonly kafkaProducer: Producer
  ) {}

  async onModuleInit() {
    await this.kafkaProducer.connect();
    console.log("Kafka producer conectado com sucesso");
  }

  async send<T = any>({ topic, key, value }: KafkaSendProps<T>) {
    await this.kafkaProducer.send({
      topic: topic,
      messages: [{ key, value: JSON.stringify({ ...value }) }],
    });
  }
}
