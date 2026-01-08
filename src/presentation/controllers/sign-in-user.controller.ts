import { Throttle } from "@nestjs/throttler";
import { SignInUserDTO } from "../../domain/DTO/user-signIn-DTO";
import { SignInUserProtocol } from "src/domain/use-cases-protocol/sign-in-user";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";

@Controller("users")
export class SignInUserController {
  constructor(private readonly signInUserUseCase: SignInUserProtocol) {}

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @HttpCode(200)
  @Post("signIn")
  async execute(@Body() { email, password }: SignInUserDTO) {
    try {
      const { token } = await this.signInUserUseCase.signIn({
        email,
        password,
      });
      return { token };
    } catch (error) {
      throw error;
    }
  }
}
