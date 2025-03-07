import { IsEmail, IsNotEmpty } from "class-validator";

export class SignInUserDTO {
  @IsEmail({}, { message: "O email é obrigatório e deve ser válido!" })
  email: string;

  @IsNotEmpty({ message: "A senha é obrigatória!" })
  password: string;
}
