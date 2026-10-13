import { IsNotEmpty, IsString } from "class-validator";

export class DeleteUserDTO {
  @IsNotEmpty({ message: "A senha é obrigatória para excluir a conta!" })
  @IsString({ message: "A senha deve ser uma string" })
  password: string;
}
