import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "src/shared/constants/user-limits";

export class UpdatePasswordDTO {
  @IsNotEmpty({ message: "A senha atual é obrigatória!" })
  @IsString({ message: "A senha atual deve ser uma string" })
  currentPassword: string;

  @IsNotEmpty({ message: "A nova senha é obrigatória!" })
  @IsString({ message: "A nova senha deve ser uma string" })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `A nova senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres!`,
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `A nova senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres!`,
  })
  newPassword: string;
}
