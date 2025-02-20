import { CreateUserDTO } from "../DTO/create-user-DTO";

export abstract class CreateUserProtocol {
  abstract create(data: CreateUserDTO): Promise<void>;
}
