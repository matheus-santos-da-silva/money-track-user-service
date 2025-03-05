import { User } from "src/domain/entities/user";
import { UsersRepositoryProtocol } from "src/infra/database/repositories/protocols/users-repository-protocol";

export class InMemoryUserRepository implements UsersRepositoryProtocol {
  users: User[] = [];

  async create(data: User): Promise<User> {
    this.users.push(data);
    return data;
  }

  async findByEmail(email: string): Promise<User> {
    const user = this.users.find((user) => user.email === email);
    return user;
  }
}
