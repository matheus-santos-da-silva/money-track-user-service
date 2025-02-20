import { User } from "src/domain/entities/user";

export abstract class UsersRepositoryProtocol {
  abstract create(data: User): Promise<User>;
  abstract findByEmail(email: string): Promise<User>;
}
