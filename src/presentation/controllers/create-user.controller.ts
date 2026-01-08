import { Throttle } from "@nestjs/throttler";
import { CreateUserDTO } from "../../domain/DTO/create-user-DTO";
import { CreateUserProtocol } from "src/domain/use-cases-protocol/create-user";
import { Body, Controller, Post } from "@nestjs/common";

@Controller("users")
export class CreateUserController {
  constructor(private readonly createUserUseCase: CreateUserProtocol) {}

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post()
  async execute(@Body() { email, name, password }: CreateUserDTO) {
    try {
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