import { Throttle } from "@nestjs/throttler";
import { AuthGuard } from "src/application/auth/auth.guard";
import { UpdateUserDTO } from "src/domain/DTO/update-user-DTO";
import { UpdateUserProtocol } from "src/domain/use-cases-protocol/update-user";
import {
  Body,
  Controller,
  Param,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";

@Controller("users")
@UseGuards(AuthGuard)
export class UpdateUserController {
  constructor(private readonly updateUserUseCase: UpdateUserProtocol) {}

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Patch(":id")
  async execute(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() { email, name }: UpdateUserDTO
  ) {
    try {
      const user = req["user"] as { id: string };

      if (user.id !== id) {
        throw new UnauthorizedException(
          "Você não pode atualizar esse usuário!"
        );
      }

      await this.updateUserUseCase.update(id, {
        email,
        name,
      });
    } catch (error) {
      throw error;
    }
  }
}
