import { User } from "src/domain/entities/user";
import { UpdateUserDTO } from "src/domain/DTO/update-user-DTO";
import { FindUserResponseDTO } from "src/domain/DTO/find-user-response-DTO";
import { CreateUserResponseDTO } from "src/domain/DTO/create-user-response-DTO";
import { findByEmailResponseDTO } from "src/domain/DTO/find-by-email-response-DTO";

export abstract class UsersRepositoryProtocol {
  abstract create(data: User): Promise<CreateUserResponseDTO>;
  abstract findByEmail(email: string): Promise<findByEmailResponseDTO>;
  abstract findById(id: string): Promise<FindUserResponseDTO>;
  abstract findPasswordById(id: string): Promise<{ password: string }>;
  abstract update(id: string, data: UpdateUserDTO): Promise<void>;
}
