import { compare } from "bcrypt";
import { AuthenticateUserResponseDTO } from "src/domain/DTO/authenticate-user-response-DTO";
import { UserAuthDTO } from "src/domain/DTO/user-auth-DTO";
import { SignInUserProtocol } from "src/domain/use-cases-protocol/sign-in-user";
import { UsersRepositoryProtocol } from "src/infra/database/repositories/protocols/users-repository-protocol";
import { createUserToken } from "src/shared/utils/create-user-token";
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class SignInUserUseCase implements SignInUserProtocol {
  constructor(private readonly repository: UsersRepositoryProtocol) {}

  async signIn({
    email,
    password,
  }: UserAuthDTO): Promise<AuthenticateUserResponseDTO> {
    try {
      const user = await this.repository.findByEmail(email);
      if (!user) {
        throw new BadRequestException("Email não cadastrado. Crie uma conta!");
      }

      const checkPassword = await compare(password, user.password);
      if (!checkPassword) {
        throw new UnauthorizedException("Senha incorreta. Tente novamente!");
      }

      const token = await createUserToken({ id: user.id });
      return { token };
    } catch (error) {
      throw error;
    }
  }
}
