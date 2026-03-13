import { IsNotEmpty, IsString } from "class-validator";

export class ValidatePurchaseDTO {
  @IsString({ message: "O purchaseToken deve ser uma string" })
  @IsNotEmpty({ message: "O purchaseToken é obrigatório" })
  purchaseToken: string;

  @IsString({ message: "O productId deve ser uma string" })
  @IsNotEmpty({ message: "O productId é obrigatório" })
  productId: string;
}
