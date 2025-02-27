import { AuthenticateUserResponseDTO } from "../DTO/authenticate-user-response-DTO";
import { SignInUserDTO } from "../DTO/user-signIn-DTO";

export abstract class SignInUserProtocol {
  abstract signIn(data: SignInUserDTO): Promise<AuthenticateUserResponseDTO>;
}
