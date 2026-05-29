import type { IntakeDraft } from "./types";
import { TARGET_VARIANTS } from "./genetics";

/**
 * Pre-filled demo patient for walkthroughs and presentations.
 * Tells a coherent story: Hungry Gut + GLP1R signal → conservative titration.
 */
export function createDemoDraft(): IntakeDraft {
  const mealDescription =
    "I had a Chipotle burrito bowl with white rice, black beans, chicken, cheese, sour cream, guacamole, chips on the side, and a regular soda. I finished it in about 15 minutes and still felt like I could keep eating.";

  const mealEstimate = {
    totalCalories: 1650,
    confidence: "high" as const,
    items: [
      { food: "Rice", estimatedCalories: 300, assumption: "Estimated ~1 cup cooked rice" },
      { food: "Chicken", estimatedCalories: 180, assumption: "Estimated ~6 oz chicken" },
      { food: "Beans", estimatedCalories: 120, assumption: "Estimated ~1/2 cup beans" },
      { food: "Cheese", estimatedCalories: 110, assumption: "Estimated standard cheese portion" },
      { food: "Sour cream", estimatedCalories: 120, assumption: "Estimated 2 tbsp sour cream" },
      { food: "Guacamole", estimatedCalories: 230, assumption: "Estimated standard guacamole portion" },
      { food: "Chips", estimatedCalories: 540, assumption: "Estimated side of chips" },
      { food: "Soda", estimatedCalories: 150, assumption: "Estimated regular soda" },
    ],
    interpretation:
      "This suggests a higher-than-average fullness threshold.",
    assumptions: [
      "Estimated ~1 cup rice",
      "Estimated ~6 oz chicken",
      "Included chips and soda",
    ],
  };

  const glp1Variant = TARGET_VARIANTS[0];
  const giprVariant = TARGET_VARIANTS[1];

  return {
    isDemo: true,
    currentStep: 0,
    patient: {
      name: "Jordan Rivera (Demo)",
      dateOfBirth: "1983-06-15",
      sex: "female",
      heightCm: 168,
      weightKg: 92,
      goalWeightKg: 78,
      currentMedicationStatus: "Tirzepatide",
      currentDose: "2.5 mg weekly",
      monthsOnMedication: "1–3 months",
      primaryGoal: "reduced side effects",
    },
    hunger: {
      mealDescription,
      aiEstimatedCalories: 1650,
      calorieEstimateConfidence: "high",
      fullnessDuration: "Less than 1 hour",
      mealEstimate,
    },
    emotional: {
      foodNoiseFrequency: "Often",
      cravingSpecificity: "Yes, strongly",
      moodHistory: "Personal history",
    },
    muscle: {
      chairStandAbility: "Yes, but with effort",
      resistanceTrainingDays: "1",
      muscleLossSymptoms: "Mildly",
    },
    autonomic: {
      orthostaticSymptoms: "Sometimes",
      restingHeartRate: 88,
      medicationIntoleranceHistory: "Mild nausea only",
    },
    genetics: {
      uploaded: true,
      consentGiven: true,
      sourceFormat: "23andMe",
      compoundRisk: false,
      variants: [
        {
          rsid: glp1Variant.rsid,
          gene: glp1Variant.gene,
          status: "detected",
          genotype: "AG",
          interpretation: glp1Variant.interpretation,
          riskContribution: 1,
        },
        {
          rsid: giprVariant.rsid,
          gene: giprVariant.gene,
          status: "not_detected",
          genotype: "CT",
          interpretation: giprVariant.interpretation,
          riskContribution: 0,
        },
      ],
    },
  };
}
