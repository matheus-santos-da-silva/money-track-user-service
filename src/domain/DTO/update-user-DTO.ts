import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateUserDTO {
  @IsOptional()
  @IsEmail({}, { message: "O email deve ser válido!" })
  email?: string;

  @IsOptional()
  @IsString({ message: "O nome deve ser uma string" })
  name?: string;

  @IsOptional()
  @IsString({ message: "A senha deve ser uma string" })
  password?: string;
}
