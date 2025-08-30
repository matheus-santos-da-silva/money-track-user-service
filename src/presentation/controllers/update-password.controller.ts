import { AuthGuard } from "src/application/auth/auth.guard";
import { UpdatePasswordDTO } from "src/domain/DTO/update-password-DTO";
import { UpdatePasswordProtocol } from "src/domain/use-cases-protocol/update-password";
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
export class UpdatePasswordController {
  constructor(private readonly updatePasswordUseCase: UpdatePasswordProtocol) {}

  @Patch(":id/password")
  async execute(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() { currentPassword, newPassword }: UpdatePasswordDTO
  ) {
    try {
      const user = req["user"] as { id: string };

      if (user.id !== id) {
        throw new UnauthorizedException(
          "Você não pode atualizar esse usuário!"
        );
      }

      await this.updatePasswordUseCase.update(id, {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      throw error;
    }
  }
}
