import { Transform } from "class-transformer";
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
} from "src/shared/constants/user-limits";

export class UpdateUserDTO {
  @IsOptional()
  @IsEmail({}, { message: "O email deve ser válido!" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @MaxLength(100, { message: "O email deve ter no máximo 100 caracteres!" })
  email?: string;

  @IsOptional()
  @IsString({ message: "O nome deve ser uma string" })
  @MinLength(NAME_MIN_LENGTH, {
    message: `O nome deve ter pelo menos ${NAME_MIN_LENGTH} caracteres!`,
  })
  @MaxLength(NAME_MAX_LENGTH, {
    message: `O nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres!`,
  })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: "O nome contém caracteres inválidos!",
  })
  name?: string;
}
