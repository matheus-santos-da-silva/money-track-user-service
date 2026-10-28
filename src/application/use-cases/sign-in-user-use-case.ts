import { compare } from "bcryptjs";
import { SignInUserDTO } from "src/domain/DTO/user-signIn-DTO";
import { createUserToken } from "src/shared/utils/create-user-token";
import { signInsTotal } from "src/shared/observability/business-metrics";
import { SignInUserProtocol } from "src/domain/use-cases-protocol/sign-in-user";
import { UsersRepositoryProtocol } from "src/infra/database/repositories/protocols/users-repository-protocol";
import { AuthenticateUserResponseDTO } from "src/domain/DTO/authenticate-user-response-DTO";
import { Injectable, UnauthorizedException } from "@nestjs/common";

// Hash (custo 12) de uma senha qualquer. Quando o e-mail não existe, comparamos com
// ele para gastar o mesmo tempo de um login real e não revelar, pelo tempo de
// resposta, se o e-mail está cadastrado.
const DUMMY_HASH =
  "$2b$12$FA0cylVAzDSxCpn8IRHM8OjfHR.Mwww3Pngd4iSCS7AwqlPesBEF.";

const INVALID_CREDENTIALS = "E-mail ou senha incorretos.";

@Injectable()
export class SignInUserUseCase implements SignInUserProtocol {
  constructor(private readonly repository: UsersRepositoryProtocol) {}

  async signIn({
    email,
    password,
  }: SignInUserDTO): Promise<AuthenticateUserResponseDTO> {
    try {
      const user = await this.repository.findByEmail(email);

      const checkPassword = await compare(
        password,
        user ? user.password : DUMMY_HASH,
      );

      // Mesma resposta para e-mail inexistente e senha errada.
      if (!user || !checkPassword) {
        signInsTotal.inc({ result: "invalid_credentials" });
        throw new UnauthorizedException(INVALID_CREDENTIALS);
      }

      signInsTotal.inc({ result: "success" });
      const token = await createUserToken({ id: user.id });
      return { token };
    } catch (error) {
      throw error;
    }
  }
}
