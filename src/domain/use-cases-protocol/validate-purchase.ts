import { ValidatePurchaseDTO } from "../DTO/validate-purchase-DTO";

export abstract class ValidatePurchaseProtocol {
  abstract validate(userId: string, data: ValidatePurchaseDTO): Promise<void>;
}
