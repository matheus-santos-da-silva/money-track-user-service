import { Transform } from "class-transformer";
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateUserDTO {
  @IsOptional()
  @IsEmail({}, { message: "O email deve ser válido!" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @MaxLength(100, { message: "O email deve ter no máximo 100 caracteres!" })
  email?: string;

  @IsOptional()
  @IsString({ message: "O nome deve ser uma string" })
  @MinLength(2, { message: "O nome deve ter pelo menos 2 caracteres!" })
  @MaxLength(100, { message: "O nome deve ter no máximo 100 caracteres!" })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: "O nome contém caracteres inválidos!",
  })
  name?: string;
}
