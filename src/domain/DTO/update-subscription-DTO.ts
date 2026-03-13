import { Plan } from "@prisma/client";

export interface UpdateSubscriptionDTO {
  plan: Plan;
  subscriptionPurchaseToken?: string | null;
  subscriptionExpiresAt?: Date | null;
}
