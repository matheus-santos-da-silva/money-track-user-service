import { Plan } from "@prisma/client";

interface PlanHolder {
  plan: Plan;
  trialEndsAt: Date;
}

// Trial ativo: plano FREE com trialEndsAt ainda no futuro.
export const isTrialActive = (user: PlanHolder, now = new Date()): boolean =>
  user.plan === "FREE" && new Date(user.trialEndsAt) >= now;

// Regra única de acesso completo (a mesma que o finance-service aplica ao gravar):
// Premium, ou trial ativo. TRIAL (hoje não usado) também conta.
export const hasPremiumAccess = (user: PlanHolder, now = new Date()): boolean =>
  user.plan === "PREMIUM" || user.plan === "TRIAL" || isTrialActive(user, now);
