import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { AuthenticateUserResponseDTO } from "src/domain/DTO/authenticate-user-response-DTO";
import { UserAuthDTO } from "src/domain/DTO/user-auth-DTO";
import { CreateUserServiceProtocol } from "src/domain/services/protocols/create-user-service-protocol";
import { CreateUserProtocol } from "src/domain/use-cases-protocol/create-user";
import { UsersRepositoryProtocol } from "src/infra/database/repositories/protocols/users-repository-protocol";
import { createUserToken } from "src/shared/utils/create-user-token";

@Injectable()
export class CreateUserUseCase implements CreateUserProtocol {
  constructor(
    private readonly service: CreateUserServiceProtocol,
    private readonly repository: UsersRepositoryProtocol
  ) {}

  async create({
    email,
    password,
  }: UserAuthDTO): Promise<AuthenticateUserResponseDTO> {
    try {
      const userAlreadyExists = await this.repository.findByEmail(email);
      if (userAlreadyExists) {
        throw new ConflictException("Usuário já cadastrado. Acesse sua conta!");
      }

      const user = await this.service.create({ email, password });
      const createdUser = await this.repository.create(user);
      if (!createdUser) {
        throw new BadRequestException(
          "Erro na criação do usuário, tente novamente mais tarde!"
        );
      }
      const token = await createUserToken({ id: createdUser.id });
      return { token };
    } catch (error) {
      throw error;
    }
  }
}
