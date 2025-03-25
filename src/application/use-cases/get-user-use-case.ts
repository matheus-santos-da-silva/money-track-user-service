import { BadRequestException, Injectable } from "@nestjs/common";
import { FindUserResponseDTO } from "src/domain/DTO/find-user-response-DTO";
import { GetUserProtocol } from "src/domain/use-cases-protocol/";
import { UsersRepositoryProtocol } from "src/infra/database/repositories/protocols/users-repository-protocol";

@Injectable()
export class GetUserUseCase implements GetUserProtocol {
  constructor(private readonly repository: UsersRepositoryProtocol) {}

  async findUser(id: string): Promise<FindUserResponseDTO> {
    try {
      const user = await this.repository.findById(id);
      if (!user) throw new BadRequestException("Usuário não encontrado!");
      return user;
    } catch (error) {
      throw error;
    }
  }
}
