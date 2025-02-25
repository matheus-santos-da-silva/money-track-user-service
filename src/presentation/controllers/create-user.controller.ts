import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserProtocol } from "src/domain/use-cases-protocol/create-user";
import { UserAuthDTO } from "../../domain/DTO/user-auth-DTO";

@Controller("users")
export class CreateUserController {
  constructor(private readonly createUserUseCase: CreateUserProtocol) {}

  @Post()
  async execute(@Body() { email, password }: UserAuthDTO) {
    try {
      const { token } = await this.createUserUseCase.create({
        email,
        password,
      });
      return { token };
    } catch (error) {
      throw error;
    }
  }
}
