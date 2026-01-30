import { Plan } from "@prisma/client";

export interface FindUserResponseDTO {
  id: string;
  name: string;
  email: string;
  plan: Plan;
  trialEndsAt: Date;
}
