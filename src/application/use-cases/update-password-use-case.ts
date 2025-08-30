import { compare } from "bcryptjs";
import { encryptPass } from "src/shared/utils/encrypt-password";
import { UpdatePasswordDTO } from "src/domain/DTO/update-password-DTO";
import { UpdatePasswordProtocol } from "src/domain/use-cases-protocol/update-password";
import { UsersRepositoryProtocol } from "src/infra/database/repositories/protocols/users-repository-protocol";
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class UpdatePasswordUseCase implements UpdatePasswordProtocol {
  constructor(private readonly repository: UsersRepositoryProtocol) {}

  async update(id: string, data: UpdatePasswordDTO): Promise<void> {
    try {
      const findPassIfUserExists = await this.repository.findPasswordById(id);
      if (!findPassIfUserExists) {
        throw new BadRequestException("Usuário não existe!");
      }

      const validPassword = await compare(
        data.currentPassword,
        findPassIfUserExists.password
      );

      if (!validPassword) {
        throw new UnauthorizedException("Não foi possível atualizar a senha");
      }

      const encryptNewPass = await encryptPass(data.newPassword);
      await this.repository.update(id, {
        password: encryptNewPass,
      });
    } catch (error) {
      throw error;
    }
  }
}
