import { DeleteUserDTO } from "../DTO/delete-user-DTO";

export abstract class DeleteUserProtocol {
  abstract delete(id: string, data: DeleteUserDTO): Promise<void>;
}
