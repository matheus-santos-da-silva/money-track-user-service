import { UpdatePasswordDTO } from "../DTO/update-password-DTO";

export abstract class UpdatePasswordProtocol {
  abstract update(id: string, data: UpdatePasswordDTO): Promise<void>;
}
