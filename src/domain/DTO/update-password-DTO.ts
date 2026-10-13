import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class UpdatePasswordDTO {
  @IsNotEmpty({ message: "A senha atual é obrigatória!" })
  @IsString({ message: "A senha atual deve ser uma string" })
  currentPassword: string;

  @IsNotEmpty({ message: "A nova senha é obrigatória!" })
  @IsString({ message: "A nova senha deve ser uma string" })
  @MinLength(6, { message: "A nova senha deve ter pelo menos 6 caracteres!" })
  @MaxLength(50, { message: "A nova senha deve ter no máximo 50 caracteres!" })
  newPassword: string;
}
