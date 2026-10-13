import { User } from "src/domain/entities/user";
import { UpdateUserDTO } from "src/domain/DTO/update-user-DTO";
import { UpdateSubscriptionDTO } from "src/domain/DTO/update-subscription-DTO";
import { FindUserResponseDTO } from "src/domain/DTO/find-user-response-DTO";
import { UsersRepositoryProtocol } from "src/infra/database/repositories/protocols/users-repository-protocol";

export class InMemoryUserRepository implements UsersRepositoryProtocol {
  users: User[] = [];

  async findPasswordById(id: string): Promise<{ password: string }> {
    const user = this.users.find((user) => user.id === id);

    if (user) return { password: user.password };
    return null;
  }

  async update(
    id: string,
    data: UpdateUserDTO & { password?: string },
  ): Promise<void> {
    const userIndex = this.users.findIndex((user) => user.id === id);

    const currentUser = this.users[userIndex];

    this.users[userIndex] = {
      ...currentUser,
      ...data,
    };
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter((user) => user.id !== id);
  }

  async findByPurchaseToken(token: string): Promise<{ id: string } | null> {
    const user = this.users.find(
      (user) => user.subscriptionPurchaseToken === token,
    );
    return user ? { id: user.id } : null;
  }

  async updateSubscription(
    id: string,
    data: UpdateSubscriptionDTO,
  ): Promise<void> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    this.users[userIndex] = { ...this.users[userIndex], ...data };
  }

  async findById(id: string): Promise<FindUserResponseDTO> {
    const user = this.users.find((user) => user.id === id);
    return user;
  }

  async create(data: User): Promise<User> {
    this.users.push(data);
    return data;
  }

  async findByEmail(email: string): Promise<User> {
    const user = this.users.find((user) => user.email === email);
    return user;
  }
}
