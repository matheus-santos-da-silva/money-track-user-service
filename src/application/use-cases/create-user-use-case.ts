import { Plan } from "@prisma/client";
import { CreateUserDTO } from "src/domain/DTO/create-user-DTO";
import { createUserToken } from "src/shared/utils/create-user-token";
import { signUpsTotal } from "src/shared/observability/business-metrics";
import { CreateUserProtocol } from "src/domain/use-cases-protocol/create-user";
import { KafkaProducerService } from "src/infra/kafka/producers/kafka-producer.service";
import { UsersRepositoryProtocol } from "src/infra/database/repositories/protocols/users-repository-protocol";
import { CreateUserServiceProtocol } from "src/domain/services/protocols/create-user-service-protocol";
import { AuthenticateUserResponseDTO } from "src/domain/DTO/authenticate-user-response-DTO";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from "@nestjs/common";

interface UserCreatedPayload {
  id: string;
  plan: Plan;
  trialEndsAt: Date;
}

@Injectable()
export class CreateUserUseCase implements CreateUserProtocol {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    private readonly service: CreateUserServiceProtocol,
    private readonly repository: UsersRepositoryProtocol,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async create({
    email,
    name,
    password,
  }: CreateUserDTO): Promise<AuthenticateUserResponseDTO> {
    try {
      const userAlreadyExists = await this.repository.findByEmail(email);
      if (userAlreadyExists) {
        throw new ConflictException("Usuário já cadastrado. Acesse sua conta!");
      }

      const user = await this.service.create({
        email,
        name,
        password,
      });

      const createdUser = await this.repository.create(user);
      if (!createdUser) {
        throw new BadRequestException(
          "Erro na criação do usuário, tente novamente mais tarde!",
        );
      }
      this.logger.log({ userId: createdUser.id }, "Usuário criado");
      signUpsTotal.add(1);

      const token = await createUserToken({ id: createdUser.id });
      await this.kafkaProducer.send<UserCreatedPayload>({
        topic: "user-created",
        key: "user-created",
        value: {
          id: createdUser.id,
          plan: user.plan,
          trialEndsAt: user.trialEndsAt,
        },
      });
      
      return { token };
    } catch (error) {
      throw error;
    }
  }
}