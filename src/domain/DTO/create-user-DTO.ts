import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateUserDTO {
  @IsEmail({}, { message: "O email é obrigatório e deve ser válido!" })
  email: string;

  @IsNotEmpty({ message: "O nome é obrigatório!" })
  name: string;

  @IsNotEmpty({ message: "A senha é obrigatória!" })
  password: string;
}
