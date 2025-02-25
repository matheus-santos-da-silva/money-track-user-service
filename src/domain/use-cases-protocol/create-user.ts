import { AuthenticateUserResponseDTO } from "../DTO/authenticate-user-response-DTO";
import { UserAuthDTO } from "../DTO/user-auth-DTO";

export abstract class CreateUserProtocol {
  abstract create(data: UserAuthDTO): Promise<AuthenticateUserResponseDTO>;
}
