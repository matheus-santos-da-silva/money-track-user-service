import { UpdateUserDTO } from "src/domain/DTO/update-user-DTO";
import { UpdateUserProtocol } from "src/domain/use-cases-protocol/update-user";
import { UsersRepositoryProtocol } from "src/infra/database/repositories/protocols/users-repository-protocol";
import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class UpdateUserUseCase implements UpdateUserProtocol {
  constructor(private readonly repository: UsersRepositoryProtocol) {}

  async update(id: string, data: UpdateUserDTO): Promise<void> {
    try {
      const userExists = await this.repository.findById(id);
      if (!userExists) throw new BadRequestException("Usuário não existe!");

      await this.repository.update(id, data);
    } catch (error) {
      throw error;
    }
  }
}
