import { AuthGuard } from "src/application/auth/auth.guard";
import { ValidatePurchaseDTO } from "src/domain/DTO/validate-purchase-DTO";
import { ValidatePurchaseProtocol } from "src/domain/use-cases-protocol/validate-purchase";
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

@Controller("subscriptions")
@UseGuards(AuthGuard)
export class ValidatePurchaseController {
  constructor(
    private readonly validatePurchaseUseCase: ValidatePurchaseProtocol,
  ) {}

  @Post("validate")
  @HttpCode(200)
  async execute(@Req() req: Request, @Body() dto: ValidatePurchaseDTO) {
    try {
      const user = req["user"] as { id: string };
      await this.validatePurchaseUseCase.validate(user.id, dto);
    } catch (error) {
      throw error;
    }
  }
}
