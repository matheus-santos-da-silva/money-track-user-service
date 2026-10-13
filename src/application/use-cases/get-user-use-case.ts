import { BadRequestException, Injectable } from "@nestjs/common";
import { GetUserResponseDTO } from "src/domain/DTO/get-user-response-DTO";
import { hasPremiumAccess, isTrialActive } from "src/shared/utils/has-premium-access";
import { GetUserProtocol } from "src/domain/use-cases-protocol/";
import { UsersRepositoryProtocol } from "src/infra/database/repositories/protocols/users-repository-protocol";

@Injectable()
export class GetUserUseCase implements GetUserProtocol {
  constructor(private readonly repository: UsersRepositoryProtocol) {}

  async findUser(id: string): Promise<GetUserResponseDTO> {
    try {
      const user = await this.repository.findById(id);
      if (!user) throw new BadRequestException("Usuário não encontrado!");
      return {
        ...user,
        isPremium: hasPremiumAccess(user),
        isTrialActive: isTrialActive(user),
      };
    } catch (error) {
      throw error;
    }
  }
}
