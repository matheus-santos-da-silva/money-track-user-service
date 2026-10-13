import { hasPremiumAccess, isTrialActive } from "src/shared/utils/has-premium-access";

const day = 86_400_000;
const future = () => new Date(Date.now() + day);
const past = () => new Date(Date.now() - day);

describe("hasPremiumAccess / isTrialActive", () => {
  it("should grant access to PREMIUM regardless of the trial", () => {
    expect(hasPremiumAccess({ plan: "PREMIUM", trialEndsAt: past() })).toBe(true);
    expect(isTrialActive({ plan: "PREMIUM", trialEndsAt: future() })).toBe(false);
  });

  it("should grant access to FREE while the trial is active", () => {
    const user = { plan: "FREE" as const, trialEndsAt: future() };
    expect(hasPremiumAccess(user)).toBe(true);
    expect(isTrialActive(user)).toBe(true);
  });

  it("should deny FREE with an expired trial", () => {
    const user = { plan: "FREE" as const, trialEndsAt: past() };
    expect(hasPremiumAccess(user)).toBe(false);
    expect(isTrialActive(user)).toBe(false);
  });

  it("should accept the trial date as a string (JSON)", () => {
    expect(
      isTrialActive({ plan: "FREE", trialEndsAt: future().toISOString() as any })
    ).toBe(true);
  });

  it("should treat the reserved TRIAL plan as full access", () => {
    expect(hasPremiumAccess({ plan: "TRIAL", trialEndsAt: past() })).toBe(true);
  });
});
