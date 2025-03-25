import { CreateUserResponseDTO } from "src/domain/DTO/create-user-response-DTO";
import { findByEmailResponseDTO } from "src/domain/DTO/find-by-email-response-DTO";
import { FindUserResponseDTO } from "src/domain/DTO/find-user-response-DTO";
import { User } from "src/domain/entities/user";

export abstract class UsersRepositoryProtocol {
  abstract create(data: User): Promise<CreateUserResponseDTO>;
  abstract findByEmail(email: string): Promise<findByEmailResponseDTO>;
  abstract findById(id: string): Promise<FindUserResponseDTO>;
}
