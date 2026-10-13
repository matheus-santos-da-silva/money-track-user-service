import { GetUserResponseDTO } from "../DTO/get-user-response-DTO";

export abstract class GetUserProtocol {
  abstract findUser(id: string): Promise<GetUserResponseDTO>;
}
