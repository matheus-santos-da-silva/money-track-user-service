import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { CreateUserProtocol } from "src/domain/use-cases-protocol/create-user";
import { CreateUserDTO } from "../../domain/DTO/create-user-DTO";

@Controller("users")
export class CreateUserController {
  constructor(private readonly createUserUseCase: CreateUserProtocol) {}

  @Post()
  async execute(@Body() { email, name, password }: CreateUserDTO) {
    try {
      if (!email) throw new BadRequestException("O email é obrigatório!");
      if (!name) throw new BadRequestException("O nome é obrigatório!");
      if (!password) throw new BadRequestException("A senha é obrigatória!");
      const { token } = await this.createUserUseCase.create({
        email,
        name,
        password,
      });
      return { token };
    } catch (error) {
      throw error;
    }
  }
}
