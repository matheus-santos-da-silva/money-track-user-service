import { Transform } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "src/shared/constants/user-limits";

export class CreateUserDTO {
  @IsNotEmpty({ message: "O email é obrigatório!" })
  @IsEmail({}, { message: "O email é obrigatório e deve ser válido!" })
  @MaxLength(100, { message: "O email deve ter no máximo 100 caracteres!" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsNotEmpty({ message: "O nome é obrigatório!" })
  @IsString({ message: "O nome deve ser um texto!" })
  @MinLength(NAME_MIN_LENGTH, {
    message: `O nome deve ter pelo menos ${NAME_MIN_LENGTH} caracteres!`,
  })
  @MaxLength(NAME_MAX_LENGTH, {
    message: `O nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres!`,
  })
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: "O nome contém caracteres inválidos!",
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsNotEmpty({ message: "A senha é obrigatória!" })
  @IsString({ message: "A senha deve ser um texto!" })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres!`,
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres!`,
  })
  password: string;
}
