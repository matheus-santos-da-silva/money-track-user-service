import { Plan } from "@prisma/client";
import { GooglePlayService } from "src/infra/store-api/google-play.service";
import { ValidatePurchaseDTO } from "src/domain/DTO/validate-purchase-DTO";
import { KafkaProducerService } from "src/infra/kafka/producers/kafka-producer.service";
import { UsersRepositoryProtocol } from "src/infra/database/repositories/protocols/users-repository-protocol";
import { ValidatePurchaseProtocol } from "src/domain/use-cases-protocol/validate-purchase";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";

@Injectable()
export class ValidatePurchaseUseCase implements ValidatePurchaseProtocol {
  private readonly logger = new Logger(ValidatePurchaseUseCase.name);

  constructor(
    private readonly repository: UsersRepositoryProtocol,
    private readonly googlePlayService: GooglePlayService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async validate(
    userId: string,
    { purchaseToken, productId }: ValidatePurchaseDTO,
  ): Promise<void> {
    const { valid, expiresAt } =
      await this.googlePlayService.verifySubscription(purchaseToken, productId);

    if (!valid) {
      this.logger.warn({ userId, productId }, "Compra recusada pela Google Play");
      throw new BadRequestException("Compra inválida ou não encontrada");
    }

    await this.repository.updateSubscription(userId, {
      plan: Plan.PREMIUM,
      subscriptionPurchaseToken: purchaseToken,
      subscriptionExpiresAt: expiresAt,
    });
    this.logger.log({ userId, productId, expiresAt }, "Compra validada: plano Premium");

    await this.kafkaProducer.send({
      topic: "user-plan-updated",
      key: "user-plan-updated",
      value: { id: userId, plan: Plan.PREMIUM },
    });
  }
}
