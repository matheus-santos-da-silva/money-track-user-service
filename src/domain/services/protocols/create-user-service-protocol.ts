import { UserAuthDTO } from "src/domain/DTO/user-auth-DTO";
import { User } from "src/domain/entities/user";

export abstract class CreateUserServiceProtocol {
  abstract create(data: UserAuthDTO): Promise<User>;
}
