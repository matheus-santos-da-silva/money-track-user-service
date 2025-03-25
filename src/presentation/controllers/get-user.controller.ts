import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtPayload, verify } from "jsonwebtoken";
import { GetUserProtocol } from "src/domain/use-cases-protocol/";

interface TokenPayload extends JwtPayload {
  id: string;
}

@Controller("users")
export class GetUserController {
  constructor(private readonly getUserUseCase: GetUserProtocol) {}

  @Get()
  async execute(@Headers("authorization") authHeader: string) {
    try {
      if (!authHeader) throw new UnauthorizedException("Token não fornecido!");

      const token = authHeader.split(" ")[1];

      let validToken: TokenPayload;
      try {
        validToken = verify(token, process.env.JWT_SECRET) as TokenPayload;
      } catch (error) {
        throw new UnauthorizedException("Token inválido ou expirado");
      }

      const user = await this.getUserUseCase.findUser(validToken.id);
      return user;
    } catch (error) {
      throw error;
    }
  }
}
