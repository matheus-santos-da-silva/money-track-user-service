import { compare } from "bcryptjs";
import { DeleteUserDTO } from "src/domain/DTO/delete-user-DTO";
import { DeleteUserProtocol } from "src/domain/use-cases-protocol/delete-user";
import { KafkaProducerService } from "src/infra/kafka/producers/kafka-producer.service";
import { UsersRepositoryProtocol } from "src/infra/database/repositories/protocols/users-repository-protocol";
import {
  BadRequestException,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";

@Injectable()
export class DeleteUserUseCase implements DeleteUserProtocol {
  constructor(
    private readonly repository: UsersRepositoryProtocol,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async delete(id: string, { password }: DeleteUserDTO): Promise<void> {
    const user = await this.repository.findPasswordById(id);
    if (!user) throw new BadRequestException("Usuário não existe!");

    const validPassword = await compare(password, user.password);
    if (!validPassword) {
      throw new ForbiddenException("Senha incorreta. Tente novamente!");
    }

    await this.repository.delete(id);

    try {
      await this.kafkaProducer.send({
        topic: "user-deleted",
        key: "user-deleted",
        value: { id },
      });
    } catch (error) {
      // A conta já foi removida aqui; sem o evento, o finance-service mantém
      // dados órfãos desse usuário. Registrado para reprocessamento manual.
      console.error(
        `Falha ao publicar user-deleted (userId=${id}). Remover os dados no finance-service manualmente.`,
        error,
      );
    }
  }
}
