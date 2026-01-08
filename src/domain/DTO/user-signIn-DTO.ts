import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInUserDTO {
  @IsEmail({}, { message: "O email é obrigatório e deve ser válido!" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsNotEmpty({ message: "A senha é obrigatória!" })
  @IsString({ message: "A senha deve ser uma string" })
  password: string;
}