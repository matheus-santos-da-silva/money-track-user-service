import { Plan } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import { KafkaProducerService } from "src/infra/kafka/producers/kafka-producer.service";
import { UsersRepositoryProtocol } from "src/infra/database/repositories/protocols/users-repository-protocol";
import {
  HandleGooglePlayWebhookProtocol,
  PubSubBody,
} from "src/domain/use-cases-protocol/handle-google-play-webhook";

const CANCELLATION_TYPES = new Set([
  3, // SUBSCRIPTION_CANCELED
  12, // SUBSCRIPTION_REVOKED
  13, // SUBSCRIPTION_EXPIRED
]);

interface SubscriptionNotification {
  notificationType: number;
  purchaseToken: string;
  subscriptionId: string;
}

interface PubSubData {
  subscriptionNotification?: SubscriptionNotification;
}

@Injectable()
export class HandleGooglePlayWebhookUseCase implements HandleGooglePlayWebhookProtocol {
  constructor(
    private readonly repository: UsersRepositoryProtocol,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async handle({ message }: PubSubBody): Promise<void> {
    let data: PubSubData;

    try {
      const decoded = Buffer.from(message.data, "base64").toString("utf-8");
      data = JSON.parse(decoded) as PubSubData;
    } catch {
      return;
    }

    const notification = data.subscriptionNotification;
    if (!notification) return;

    const { notificationType, purchaseToken } = notification;

    if (!CANCELLATION_TYPES.has(notificationType)) return;

    const user = await this.repository.findByPurchaseToken(purchaseToken);
    if (!user) return;

    await this.repository.updateSubscription(user.id, {
      plan: Plan.FREE,
      subscriptionPurchaseToken: null,
      subscriptionExpiresAt: null,
    });

    await this.kafkaProducer.send({
      topic: "user-plan-updated",
      key: "user-plan-updated",
      value: { id: user.id, plan: Plan.FREE },
    });
  }
}
