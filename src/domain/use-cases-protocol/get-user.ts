import { FindUserResponseDTO } from "../DTO/find-user-response-DTO";

export abstract class GetUserProtocol {
  abstract findUser(id: string): Promise<FindUserResponseDTO>;
}
