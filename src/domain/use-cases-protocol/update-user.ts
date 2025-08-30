import { UpdateUserDTO } from "../DTO/update-user-DTO";

export abstract class UpdateUserProtocol {
  abstract update(id: string, data: UpdateUserDTO): Promise<void>;
}
