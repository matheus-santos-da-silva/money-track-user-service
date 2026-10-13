import { Plan } from "@prisma/client";

interface UserProps {
  email: string;
  name: string;
  password: string;
  plan: Plan;
  trialStartedAt: Date;
  trialEndsAt: Date;
}

export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  plan: Plan;
  created_at: Date;
  trialStartedAt: Date;
  trialEndsAt: Date;
  subscriptionPurchaseToken?: string | null;
  subscriptionExpiresAt?: Date | null;

  constructor({
    email,
    name,
    plan,
    password,
    trialStartedAt,
    trialEndsAt,
  }: UserProps) {
    this.email = email;
    this.name = name;
    this.plan = plan;
    this.password = password;
    this.trialStartedAt = trialStartedAt;
    this.trialEndsAt = trialEndsAt;
  }
}
