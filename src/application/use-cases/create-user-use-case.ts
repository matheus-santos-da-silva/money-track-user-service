import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { CreateUserDTO } from "src/domain/DTO/create-user-DTO";
import { CreateUserServiceProtocol } from "src/domain/services/protocols/create-user-service-protocol";
import { CreateUserProtocol } from "src/domain/use-cases-protocol/create-user";
import { UsersRepositoryProtocol } from "src/infra/database/repositories/protocols/users-repository-protocol";

@Injectable()
export class CreateUserUseCase implements CreateUserProtocol {
  constructor(
    private readonly service: CreateUserServiceProtocol,
    private readonly repository: UsersRepositoryProtocol
  ) {}

  async create({ email, password }: CreateUserDTO): Promise<void> {
    try {
      const userAlreadyExists = await this.repository.findByEmail(email);
      if (userAlreadyExists) {
        throw new ConflictException("Usuário já existe, entre em sua conta!!");
      }

      const user = await this.service.create({ email, password });
      const createdUser = await this.repository.create(user);
      if (!createdUser) {
        throw new BadRequestException(
          "Erro na criação do usuário, tente novamente mais tarde!"
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
