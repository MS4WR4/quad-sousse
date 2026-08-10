export const EXPERIENCE_IDS = [
  "signature",
  "golden-hour",
  "private",
] as const;

export type ExperienceId = (typeof EXPERIENCE_IDS)[number];

export const DEFAULT_EXPERIENCE: ExperienceId = "signature";

const PRICE_MULTIPLIERS: Record<
  ExperienceId,
  { numerator: number; denominator: number }
> = {
  signature: { numerator: 100, denominator: 100 },
  "golden-hour": { numerator: 165, denominator: 100 },
  private: { numerator: 250, denominator: 100 },
};

export function isExperienceId(value: unknown): value is ExperienceId {
  return (
    typeof value === "string" &&
    EXPERIENCE_IDS.includes(value as ExperienceId)
  );
}

export function calculateExperiencePrice(
  basePrice: number,
  experience: ExperienceId,
): number {
  const multiplier = PRICE_MULTIPLIERS[experience];
  return Math.round(
    (basePrice * multiplier.numerator) / multiplier.denominator,
  );
}
