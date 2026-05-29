import type { IntakeDraft, IntakeResponse, ReportPayload } from "./types";
import {
  getAncillaryRecommendations,
  HARD_SAFETY_RULE,
  HOLD_REDUCE_PROTOCOL,
  PROTOCOL_INFO,
} from "./dosingProtocols";
import { buildClinicalReportContent } from "./clinicalReportContent";
import { scoreIntake } from "./scoring";

function effectiveCalories(intake: IntakeResponse): number | null {
  const h = intake.hunger;
  return (
    h.userEditedCalories ??
    h.aiEstimatedCalories ??
    h.mealEstimate?.totalCalories ??
    null
  );
}

/** Build safety flags for report section */
function buildSafetyFlags(intake: IntakeResponse): string[] {
  const flags: string[] = [HARD_SAFETY_RULE];
  const s = intake.scores;
  if (!s) return flags;

  if (intake.autonomic.restingHeartRate && intake.autonomic.restingHeartRate > 100) {
    flags.push("Resting heart rate >100 bpm — clinician review recommended.");
  }
  if (s.autonomicRisk >= 2) {
    flags.push("Elevated autonomic sensitivity — consider microdosing and orthostatic monitoring.");
  }
  if (s.sarcopeniaRisk >= 2) {
    flags.push("Elevated muscle-loss risk — prioritize protein and resistance training before dose escalation.");
  }
  if (intake.genetics.compoundRisk) {
    flags.push("Compound genetic tolerability risk detected.");
  }
  if (s.dopamineVulnerability && s.dopamineVulnerability >= 1) {
    flags.push(
      "Reward-system vulnerability — monitor for emotional flatness or reduced pleasure."
    );
  }

  return flags;
}

/** Assemble full clinician report payload */
export function generateReport(intake: IntakeResponse): IntakeResponse {
  scoreIntake(intake);
  const s = intake.scores!;
  const protocolInfo = PROTOCOL_INFO[s.protocol];
  const calories = effectiveCalories(intake);

  const equationDisplay = `V = ${s.efficacyScore} / (${s.tolerabilityBrake} + ${s.structuralRisk}) = ${s.titrationVelocity}`;
  const velocityExplanation = `Optimal Titration Velocity = Expected Efficacy / (Tolerability Brake + Structural Risk)`;

  const summaryParts = [
    `Primary phenotype: ${s.primaryPhenotype}${
      s.secondaryPhenotype ? ` with secondary ${s.secondaryPhenotype} signal` : ""
    }.`,
    calories
      ? `Patient reports fullness after approximately ${calories} kcal.`
      : "Meal calorie estimate not provided.",
    intake.genetics.uploaded
      ? `Genetic screen completed (${intake.genetics.variants.length} markers reviewed).`
      : "No genetic file uploaded.",
    `Suggested protocol: ${protocolInfo.label}.`,
  ];

  const report: ReportPayload = {
    protocol: s.protocol,
    summary: summaryParts.join(" "),
    clinical: buildClinicalReportContent(intake),
    recommendations: getAncillaryRecommendations({
      primaryPhenotype: s.primaryPhenotype,
      secondaryPhenotype: s.secondaryPhenotype,
      autonomicRisk: s.autonomicRisk,
      sarcopeniaRisk: s.sarcopeniaRisk,
      geneticRisk: s.geneticRisk,
      emotionalEatingScore: s.emotionalEatingScore,
      compoundGenetic: intake.genetics.compoundRisk,
    }),
    safetyFlags: buildSafetyFlags(intake),
    equationDisplay,
    velocityExplanation,
  };

  intake.report = report;
  return intake;
}

/** Create final intake with new id ready for storage */
export function finalizeIntake(draft: IntakeDraft | IntakeResponse): IntakeResponse {
  const id = crypto.randomUUID();
  const intake: IntakeResponse = {
    ...draft,
    id,
    createdAt: new Date().toISOString(),
  };
  return generateReport(intake);
}

export { HOLD_REDUCE_PROTOCOL };
