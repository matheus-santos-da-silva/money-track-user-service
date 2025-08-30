import { IsNotEmpty, IsString } from "class-validator";

export class UpdatePasswordDTO {
  @IsNotEmpty({ message: "A senha atual é obrigatória!" })
  @IsString({ message: "A senha atual deve ser uma string" })
  currentPassword: string;

  @IsNotEmpty({ message: "A nova senha é obrigatória!" })
  @IsString({ message: "A nova senha deve ser uma string" })
  newPassword: string;
}
