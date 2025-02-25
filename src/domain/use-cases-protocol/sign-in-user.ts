import { AuthenticateUserResponseDTO } from "../DTO/authenticate-user-response-DTO";
import { UserAuthDTO } from "../DTO/user-auth-DTO";

export abstract class SignInUserProtocol {
  abstract signIn(data: UserAuthDTO): Promise<AuthenticateUserResponseDTO>;
}
