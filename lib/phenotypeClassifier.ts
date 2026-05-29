import type { PhenotypeType, PrecisionScores } from "./types";

type PhenotypeScores = {
  label: PhenotypeType;
  score: number;
};

/** Determine primary and secondary phenotypes from raw dimension scores */
export function classifyPhenotypes(scores: {
  hungryBrainScore: number;
  hungryGutScore: number;
  emotionalEatingScore: number;
  slowBurnScore: number;
}): { primary: PhenotypeType; secondary?: PhenotypeType } {
  const entries: PhenotypeScores[] = [
    { label: "Hungry Gut", score: scores.hungryGutScore },
    { label: "Hungry Brain", score: scores.hungryBrainScore },
    { label: "Emotional Eating", score: scores.emotionalEatingScore },
    { label: "Slow Burn", score: scores.slowBurnScore },
  ];

  const sorted = [...entries].sort((a, b) => b.score - a.score);
  const primary = sorted[0]?.label ?? "Hungry Gut";
  const second = sorted[1];

  // Secondary if within 1 point of primary and score > 0
  const secondary =
    second && second.score > 0 && sorted[0].score - second.score <= 1
      ? second.label
      : undefined;

  return { primary, secondary };
}

/** Weighted blend for display (45/30/15/10 per spec) */
export function weightedPhenotypeBlend(scores: {
  hungryGutScore: number;
  hungryBrainScore: number;
  emotionalEatingScore: number;
  slowBurnScore: number;
}): number {
  return (
    scores.hungryGutScore * 0.45 +
    scores.hungryBrainScore * 0.3 +
    scores.emotionalEatingScore * 0.15 +
    scores.slowBurnScore * 0.1
  );
}

/** Efficacy score from primary phenotype (V1 simple method) */
export function efficacyFromPrimary(primary: PhenotypeType): number {
  const map: Record<PhenotypeType, number> = {
    "Hungry Gut": 2.0,
    "Hungry Brain": 1.5,
    "Emotional Eating": 1.0,
    "Slow Burn": 0.5,
  };
  return map[primary];
}

export function attachPhenotypesToScores(
  partial: Omit<PrecisionScores, "primaryPhenotype" | "secondaryPhenotype" | "efficacyScore">
): PrecisionScores {
  const { primary, secondary } = classifyPhenotypes(partial);
  const efficacyScore = efficacyFromPrimary(primary);
  return {
    ...partial,
    primaryPhenotype: primary,
    secondaryPhenotype: secondary,
    efficacyScore,
  };
}
