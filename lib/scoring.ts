import type { IntakeResponse, PrecisionScores, ProtocolType } from "./types";
import { attachPhenotypesToScores, efficacyFromPrimary } from "./phenotypeClassifier";

/** Calories used for Hungry Brain scoring — user override wins */
function effectiveCalories(intake: IntakeResponse): number | null {
  const h = intake.hunger;
  const c =
    h.userEditedCalories ?? h.aiEstimatedCalories ?? h.mealEstimate?.totalCalories;
  return c != null && c > 0 ? c : null;
}

/** Map calorie threshold to Hungry Brain score 0–3 */
export function scoreHungryBrain(calories: number | null): number {
  if (calories == null) return 0;
  if (calories < 1000) return 0;
  if (calories <= 1500) return 1;
  if (calories <= 2000) return 2;
  return 3;
}

/** Fullness duration → Hungry Gut score */
export function scoreHungryGut(fullnessDuration: string): number {
  const map: Record<string, number> = {
    "Less than 1 hour": 3,
    "1–2 hours": 2,
    "2–4 hours": 1,
    "4+ hours": 0,
  };
  return map[fullnessDuration] ?? 0;
}

/** Food noise frequency → Emotional Eating score */
export function scoreEmotionalEating(foodNoise: string): number {
  const map: Record<string, number> = {
    Never: 0,
    Sometimes: 1,
    Often: 2,
    "Almost always": 3,
  };
  return map[foodNoise] ?? 0;
}

/** Slow Burn composite from muscle section */
export function scoreSlowBurn(muscle: IntakeResponse["muscle"]): number {
  let score = 0;
  const chairMap: Record<string, number> = {
    "Yes, easily": 0,
    "Yes, but with effort": 1,
    No: 2,
    "Not sure": 0.5,
  };
  score += chairMap[muscle.chairStandAbility] ?? 0;

  const rtMap: Record<string, number> = {
    "0": 1.5,
    "1": 1,
    "2–3": 0.5,
    "4+": 0,
  };
  score += rtMap[muscle.resistanceTrainingDays] ?? 0;

  const symptomMap: Record<string, number> = {
    No: 0,
    Mildly: 0.5,
    Yes: 1,
    "Yes, significantly": 2,
  };
  score += symptomMap[muscle.muscleLossSymptoms] ?? 0;

  return Math.min(score, 5);
}

/** Sarcopenia structural risk */
export function scoreSarcopenia(intake: IntakeResponse): number {
  let risk = scoreSlowBurn(intake.muscle);
  const age = intake.age ?? calculateAge(intake.patient.dateOfBirth);
  if (age > 65) risk += 1.5;
  return Math.min(risk, 5);
}

/** Autonomic / POTS-style risk */
export function scoreAutonomic(autonomic: IntakeResponse["autonomic"]): number {
  let risk = 0;
  const orthoMap: Record<string, number> = {
    Never: 0,
    Rarely: 0.5,
    Sometimes: 1.5,
    Often: 2,
  };
  risk += orthoMap[autonomic.orthostaticSymptoms] ?? 0;

  const rhr = autonomic.restingHeartRate;
  if (rhr != null) {
    if (rhr > 100) risk += 2;
    else if (rhr > 90) risk += 1;
  }
  return Math.min(risk, 5);
}

/** Medication intolerance → tolerability brake component */
export function scoreMedicationIntolerance(history: string): number {
  const map: Record<string, number> = {
    No: 0,
    "Mild nausea only": 0.5,
    "Vomiting once": 1,
    "Persistent vomiting or severe reaction": 2,
  };
  return map[history] ?? 0;
}

/** Mood history → dopamine vulnerability (display + minor context) */
export function scoreDopamineVulnerability(moodHistory: string): number {
  const map: Record<string, number> = {
    No: 0,
    "Personal history": 1,
    "Family history": 0.5,
    "Both personal and family history": 1.5,
  };
  return map[moodHistory] ?? 0;
}

/** Genetic risk from variant results */
export function scoreGeneticRisk(
  variants: IntakeResponse["genetics"]["variants"]
): { geneticRisk: number; compoundRisk: boolean } {
  const glp1 = variants.find((v) => v.rsid === "rs10305420");
  const gipr = variants.find((v) => v.rsid === "rs1800437");
  let geneticRisk = 0;
  if (glp1?.status === "detected") geneticRisk += 1;
  if (gipr?.status === "detected") geneticRisk += 1;
  const compoundRisk =
    glp1?.status === "detected" && gipr?.status === "detected";
  if (compoundRisk) geneticRisk += 1.5;
  return { geneticRisk, compoundRisk };
}

export function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function calculateBmi(heightCm: number, weightKg: number): number {
  if (!heightCm || !weightKg) return 0;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

/** Assign protocol from titration velocity V */
export function protocolFromVelocity(v: number): ProtocolType {
  if (v > 1.5) return "standard";
  if (v >= 0.8) return "gradual_adaptive";
  return "microdosing";
}

/** Full precision scoring pipeline */
export function computePrecisionScores(intake: IntakeResponse): PrecisionScores {
  const calories = effectiveCalories(intake);
  const hungryBrainScore = scoreHungryBrain(calories);
  const hungryGutScore = scoreHungryGut(intake.hunger.fullnessDuration);
  const emotionalEatingScore = scoreEmotionalEating(
    intake.emotional.foodNoiseFrequency
  );
  const slowBurnScore = scoreSlowBurn(intake.muscle);
  const sarcopeniaRisk = scoreSarcopenia(intake);
  const autonomicRisk = scoreAutonomic(intake.autonomic);
  const medIntolerance = scoreMedicationIntolerance(
    intake.autonomic.medicationIntoleranceHistory
  );
  const { geneticRisk, compoundRisk } = scoreGeneticRisk(
    intake.genetics.variants
  );

  const tolerabilityBrake = geneticRisk + medIntolerance;
  const structuralRisk = Math.min(sarcopeniaRisk + autonomicRisk, 5);
  const denominator = Math.max(tolerabilityBrake + structuralRisk, 0.5);

  const partial = {
    hungryBrainScore,
    hungryGutScore,
    emotionalEatingScore,
    slowBurnScore,
    sarcopeniaRisk,
    autonomicRisk,
    geneticRisk,
    tolerabilityBrake,
    structuralRisk,
    dopamineVulnerability: scoreDopamineVulnerability(
      intake.emotional.moodHistory
    ),
    titrationVelocity: 0,
    protocol: "microdosing" as ProtocolType,
    primaryPhenotype: "Hungry Gut" as const,
    efficacyScore: 0,
  };

  const withPhenotype = attachPhenotypesToScores(partial);
  const efficacyScore = efficacyFromPrimary(withPhenotype.primaryPhenotype);
  const titrationVelocity =
    Math.round((efficacyScore / denominator) * 100) / 100;
  const protocol = protocolFromVelocity(titrationVelocity);

  intake.genetics.compoundRisk = compoundRisk;

  return {
    ...withPhenotype,
    efficacyScore,
    titrationVelocity,
    protocol,
  };
}

/** Enrich intake with age, BMI, scores */
export function scoreIntake(intake: IntakeResponse): IntakeResponse {
  intake.age = calculateAge(intake.patient.dateOfBirth);
  intake.bmi = calculateBmi(
    intake.patient.heightCm,
    intake.patient.weightKg
  );
  intake.scores = computePrecisionScores(intake);
  return intake;
}
