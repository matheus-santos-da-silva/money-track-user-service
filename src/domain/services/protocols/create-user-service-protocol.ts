import { CreateUserDTO } from "src/domain/DTO/create-user-DTO";
import { User } from "src/domain/entities/user";

export abstract class CreateUserServiceProtocol {
  abstract create(data: CreateUserDTO): Promise<User>;
}
