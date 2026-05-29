/** Phenotype labels used across scoring and reports */
export type PhenotypeType =
  | "Hungry Gut"
  | "Hungry Brain"
  | "Emotional Eating"
  | "Slow Burn";

export type ProtocolType = "standard" | "gradual_adaptive" | "microdosing";

export type ConfidenceLevel = "low" | "medium" | "high";

export type GeneticVariantStatus = "detected" | "not_detected" | "not_found";

export type GeneticSourceFormat =
  | "23andMe"
  | "AncestryDNA"
  | "MyHeritage"
  | "Unknown";

/** Single food line item from meal estimation */
export type MealItem = {
  food: string;
  estimatedCalories: number;
  assumption: string;
};

/** Structured meal estimate returned by mock/AI estimator */
export type MealEstimate = {
  totalCalories: number;
  confidence: ConfidenceLevel;
  items: MealItem[];
  interpretation: string;
  assumptions: string[];
};

/** One screened genetic variant result */
export type GeneticVariantResult = {
  rsid: string;
  gene: string;
  status: GeneticVariantStatus;
  genotype?: string;
  interpretation: string;
  riskContribution: number;
};

/** All computed precision scores */
export type PrecisionScores = {
  hungryBrainScore: number;
  hungryGutScore: number;
  emotionalEatingScore: number;
  slowBurnScore: number;
  sarcopeniaRisk: number;
  autonomicRisk: number;
  geneticRisk: number;
  tolerabilityBrake: number;
  structuralRisk: number;
  efficacyScore: number;
  titrationVelocity: number;
  protocol: ProtocolType;
  primaryPhenotype: PhenotypeType;
  secondaryPhenotype?: PhenotypeType;
  dopamineVulnerability?: number;
};

/** Patient basics from step 1 */
export type PatientBasics = {
  name: string;
  dateOfBirth: string;
  sex: string;
  heightCm: number;
  weightKg: number;
  goalWeightKg?: number;
  currentMedicationStatus: string;
  currentDose?: string;
  monthsOnMedication?: string;
  primaryGoal: string;
};

/** Hunger section answers */
export type HungerAnswers = {
  mealDescription: string;
  aiEstimatedCalories?: number;
  userEditedCalories?: number;
  calorieEstimateConfidence?: ConfidenceLevel;
  fullnessDuration: string;
  mealEstimate?: MealEstimate;
};

/** Emotional eating section */
export type EmotionalAnswers = {
  foodNoiseFrequency: string;
  cravingSpecificity: string;
  moodHistory: string;
};

/** Muscle / metabolic section */
export type MuscleAnswers = {
  chairStandAbility: string;
  resistanceTrainingDays: string;
  muscleLossSymptoms: string;
};

/** Autonomic / side-effect section */
export type AutonomicAnswers = {
  orthostaticSymptoms: string;
  restingHeartRate?: number;
  medicationIntoleranceHistory: string;
};

/** Genetics section */
export type GeneticsAnswers = {
  uploaded: boolean;
  consentGiven: boolean;
  sourceFormat?: GeneticSourceFormat;
  variants: GeneticVariantResult[];
  compoundRisk?: boolean;
};

/** Generated report payload */
export type ReportPayload = {
  protocol: ProtocolType;
  summary: string;
  recommendations: string[];
  safetyFlags: string[];
  clinicianNotes?: string;
  equationDisplay: string;
  velocityExplanation: string;
  /** Rich clinical protocol document */
  clinical?: import("./clinicalReportContent").ClinicalReportContent;
};

/** Full intake record stored in localStorage */
export type IntakeResponse = {
  id: string;
  createdAt: string;
  patient: PatientBasics;
  hunger: HungerAnswers;
  emotional: EmotionalAnswers;
  muscle: MuscleAnswers;
  autonomic: AutonomicAnswers;
  genetics: GeneticsAnswers;
  scores?: PrecisionScores;
  report?: ReportPayload;
  /** Computed helpers for display */
  age?: number;
  bmi?: number;
};

/** Wizard draft (in-progress, no id until report generated) */
export type IntakeDraft = Omit<IntakeResponse, "id" | "createdAt" | "scores" | "report"> & {
  currentStep?: number;
  /** True when using pre-filled demo patient data */
  isDemo?: boolean;
};

/** Empty draft factory */
export function createEmptyDraft(): IntakeDraft {
  return {
    patient: {
      name: "",
      dateOfBirth: "",
      sex: "",
      heightCm: 0,
      weightKg: 0,
      currentMedicationStatus: "Not started",
      primaryGoal: "weight loss",
    },
    hunger: {
      mealDescription: "",
      fullnessDuration: "",
    },
    emotional: {
      foodNoiseFrequency: "",
      cravingSpecificity: "",
      moodHistory: "",
    },
    muscle: {
      chairStandAbility: "",
      resistanceTrainingDays: "",
      muscleLossSymptoms: "",
    },
    autonomic: {
      orthostaticSymptoms: "",
      medicationIntoleranceHistory: "",
    },
    genetics: {
      uploaded: false,
      consentGiven: false,
      variants: [],
    },
    currentStep: 0,
  };
}
