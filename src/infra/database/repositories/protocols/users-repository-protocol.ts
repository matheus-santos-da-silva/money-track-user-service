import { User } from "src/domain/entities/user";
import { UpdateUserDTO } from "src/domain/DTO/update-user-DTO";
import { FindUserResponseDTO } from "src/domain/DTO/find-user-response-DTO";
import { CreateUserResponseDTO } from "src/domain/DTO/create-user-response-DTO";
import { findByEmailResponseDTO } from "src/domain/DTO/find-by-email-response-DTO";
import { UpdateSubscriptionDTO } from "src/domain/DTO/update-subscription-DTO";

export abstract class UsersRepositoryProtocol {
  abstract create(data: User): Promise<CreateUserResponseDTO>;
  abstract findByEmail(email: string): Promise<findByEmailResponseDTO>;
  abstract findById(id: string): Promise<FindUserResponseDTO>;
  abstract findPasswordById(id: string): Promise<{ password: string }>;
  // password só é gravado internamente (troca de senha), nunca vem do DTO do endpoint.
  abstract update(
    id: string,
    data: UpdateUserDTO & { password?: string },
  ): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract findByPurchaseToken(token: string): Promise<{ id: string } | null>;
  abstract updateSubscription(id: string, data: UpdateSubscriptionDTO): Promise<void>;
}
