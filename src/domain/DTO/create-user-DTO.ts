import { Transform } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserDTO {
  @IsNotEmpty({ message: "O email é obrigatório!" })
  @IsEmail({}, { message: "O email é obrigatório e deve ser válido!" })
  @MaxLength(100, { message: "O email deve ter no máximo 100 caracteres!" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsNotEmpty({ message: "O nome é obrigatório!" })
  @IsString({ message: "O nome deve ser um texto!" })
  @MinLength(2, { message: "O nome deve ter pelo menos 2 caracteres!" })
  @MaxLength(100, { message: "O nome deve ter no máximo 100 caracteres!" })
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: "O nome contém caracteres inválidos!",
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsNotEmpty({ message: "A senha é obrigatória!" })
  @IsString({ message: "A senha deve ser um texto!" })
  @MinLength(6, { message: "A senha deve ter pelo menos 6 caracteres!" })
  @MaxLength(50, { message: "A senha deve ter no máximo 50 caracteres!" })
  password: string;
}
