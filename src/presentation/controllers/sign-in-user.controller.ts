import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { UserAuthDTO } from "../../domain/DTO/user-auth-DTO";
import { SignInUserProtocol } from "src/domain/use-cases-protocol/sign-in-user";

@Controller("users")
export class SignInUserController {
  constructor(private readonly signInUserUseCase: SignInUserProtocol) {}

  @HttpCode(200)
  @Post("signIn")
  async execute(@Body() { email, password }: UserAuthDTO) {
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
