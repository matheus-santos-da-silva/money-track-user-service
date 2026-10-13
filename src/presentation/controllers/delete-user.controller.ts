import { Request } from "express";
import { Throttle } from "@nestjs/throttler";
import { AuthGuard } from "src/application/auth/auth.guard";
import { DeleteUserDTO } from "src/domain/DTO/delete-user-DTO";
import { DeleteUserProtocol } from "src/domain/use-cases-protocol/delete-user";
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Req,
  ForbiddenException,
  UseGuards,
} from "@nestjs/common";

@Controller("users")
@UseGuards(AuthGuard)
export class DeleteUserController {
  constructor(private readonly deleteUserUseCase: DeleteUserProtocol) {}

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Delete(":id")
  @HttpCode(204)
  async execute(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() { password }: DeleteUserDTO,
  ) {
    const user = req["user"] as { id: string };

    if (user.id !== id) {
      throw new ForbiddenException("Você não pode excluir esse usuário!");
    }

    await this.deleteUserUseCase.delete(id, { password });
  }
}
