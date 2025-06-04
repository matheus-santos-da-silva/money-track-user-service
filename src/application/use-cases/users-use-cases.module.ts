import { Module } from "@nestjs/common";
import { Producer } from "@nestjs/microservices/external/kafka.interface";
import { UsersServicesModule } from "src/domain/services/users-services.module";
import { KafkaProducerService } from "src/infra/kafka/producers/kafka-producer.service";
import { UsersRepositoriesModule } from "src/infra/database/repositories/users-repositories.module";
import { ClientKafka, ClientsModule, Transport } from "@nestjs/microservices";
import { SignInUserUseCase, CreateUserUseCase, GetUserUseCase } from "./";
import {
  SignInUserProtocol,
  CreateUserProtocol,
  GetUserProtocol,
} from "src/domain/use-cases-protocol/";

@Module({
  imports: [
    UsersRepositoriesModule,
    UsersServicesModule,
    ClientsModule.register([
      {
        name: "KAFKA_SERVICE",
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [process.env.KAFKA_URL],
          },
        },
      },
    ]),
  ],
  providers: [
    KafkaProducerService,
    {
      provide: CreateUserProtocol,
      useClass: CreateUserUseCase,
    },
    {
      provide: SignInUserProtocol,
      useClass: SignInUserUseCase,
    },
    {
      provide: GetUserProtocol,
      useClass: GetUserUseCase,
    },
    {
      provide: "KAFKA_PRODUCER",
      useFactory: async (kafkaService: ClientKafka): Promise<Producer> => {
        return kafkaService.connect();
      },
      inject: ["KAFKA_SERVICE"],
    },
  ],
  exports: [CreateUserProtocol, SignInUserProtocol, GetUserProtocol],
})
export class UsersUseCasesModule {}
