import { AuthenticateUserResponseDTO } from "../DTO/authenticate-user-response-DTO";
import { CreateUserDTO } from "../DTO/create-user-DTO";

export abstract class CreateUserProtocol {
  abstract create(data: CreateUserDTO): Promise<AuthenticateUserResponseDTO>;
}
