import type { IntakeDraft } from "./types";

export type IntakeSection =
  | "welcome"
  | "about-you"
  | "hunger"
  | "eating-mood"
  | "body-strength"
  | "side-effects"
  | "genetics"
  | "finish";

export type StepDefinition = {
  id: string;
  section: IntakeSection;
  sectionLabel: string;
  title: string;
  subtitle?: string;
  helperText?: string;
  icon: string;
  optional?: boolean;
  /** Skip this step based on current draft */
  skip?: (draft: IntakeDraft) => boolean;
  validate: (draft: IntakeDraft) => string | null;
};

export const SECTION_ORDER: IntakeSection[] = [
  "welcome",
  "about-you",
  "hunger",
  "eating-mood",
  "body-strength",
  "side-effects",
  "genetics",
  "finish",
];

export const INTAKE_STEPS: StepDefinition[] = [
  {
    id: "welcome",
    section: "welcome",
    sectionLabel: "Start",
    title: "Let's personalize your GLP-1 plan",
    subtitle:
      "A few questions about your biology, eating patterns, and tolerability — then we'll build a clinician-ready report.",
    icon: "✨",
    validate: () => null,
  },
  {
    id: "name",
    section: "about-you",
    sectionLabel: "About you",
    title: "What's your full name?",
    subtitle: "Used on your clinician report only.",
    icon: "👤",
    validate: (d) =>
      d.patient.name.trim() ? null : "Please enter your name.",
  },
  {
    id: "dob",
    section: "about-you",
    sectionLabel: "About you",
    title: "What's your date of birth?",
    icon: "🎂",
    validate: (d) =>
      d.patient.dateOfBirth ? null : "Date of birth is required.",
  },
  {
    id: "sex",
    section: "about-you",
    sectionLabel: "About you",
    title: "Sex assigned at birth",
    icon: "📋",
    validate: (d) => (d.patient.sex ? null : "Please select an option."),
  },
  {
    id: "height",
    section: "about-you",
    sectionLabel: "About you",
    title: "How tall are you?",
    subtitle: "In centimeters — used for context on your report.",
    icon: "📏",
    validate: (d) =>
      d.patient.heightCm > 0 ? null : "Please enter a valid height.",
  },
  {
    id: "weight",
    section: "about-you",
    sectionLabel: "About you",
    title: "What's your current weight?",
    subtitle: "In kilograms. BMI is background context only — not the main factor.",
    icon: "⚖️",
    validate: (d) =>
      d.patient.weightKg > 0 ? null : "Please enter a valid weight.",
  },
  {
    id: "goal-weight",
    section: "about-you",
    sectionLabel: "About you",
    title: "Do you have a goal weight?",
    subtitle: "Optional — skip if you're not sure yet.",
    icon: "🎯",
    optional: true,
    validate: () => null,
  },
  {
    id: "medication",
    section: "about-you",
    sectionLabel: "About you",
    title: "Are you currently on a GLP-1 medication?",
    icon: "💊",
    validate: (d) =>
      d.patient.currentMedicationStatus ? null : "Please select an option.",
  },
  {
    id: "dose",
    section: "about-you",
    sectionLabel: "About you",
    title: "What's your current dose?",
    subtitle: "Approximate is fine — e.g. 2.5 mg weekly.",
    icon: "💉",
    optional: true,
    skip: (d) => d.patient.currentMedicationStatus === "Not started",
    validate: () => null,
  },
  {
    id: "months-on-med",
    section: "about-you",
    sectionLabel: "About you",
    title: "How long have you been on it?",
    icon: "📅",
    optional: true,
    skip: (d) => d.patient.currentMedicationStatus === "Not started",
    validate: () => null,
  },
  {
    id: "primary-goal",
    section: "about-you",
    sectionLabel: "About you",
    title: "What's your primary goal right now?",
    icon: "🧭",
    validate: (d) =>
      d.patient.primaryGoal ? null : "Please select your main goal.",
  },
  {
    id: "meal-description",
    section: "hunger",
    sectionLabel: "Hunger profile",
    title: "Think of a meal where you finally felt physically full",
    subtitle:
      "What did you eat, how much, and how long did it take to feel full?",
    icon: "🍽️",
    validate: (d) =>
      d.hunger.mealDescription.trim()
        ? null
        : "Describe a recent meal to continue.",
  },
  {
    id: "meal-calories",
    section: "hunger",
    sectionLabel: "Hunger profile",
    title: "Estimate calories for that meal",
    subtitle: "Our AI breaks down portions — you can adjust the total.",
    icon: "🔥",
    validate: (d) => {
      const has =
        d.hunger.userEditedCalories ||
        d.hunger.aiEstimatedCalories ||
        d.hunger.mealEstimate?.totalCalories;
      return has ? null : "Run the estimate or enter calories manually.";
    },
  },
  {
    id: "fullness-duration",
    section: "hunger",
    sectionLabel: "Hunger profile",
    title: "After a normal meal, how long does fullness usually last?",
    helperText:
      "Feeling hungry again soon may suggest faster gastric emptying or weaker satiety signaling.",
    icon: "⏱️",
    validate: (d) =>
      d.hunger.fullnessDuration ? null : "Please select an option.",
  },
  {
    id: "food-noise",
    section: "eating-mood",
    sectionLabel: "Food & mood",
    title: "When stressed, bored, or tired — do you crave snacks even when not hungry?",
    icon: "🧠",
    validate: (d) =>
      d.emotional.foodNoiseFrequency ? null : "Please select an option.",
  },
  {
    id: "cravings",
    section: "eating-mood",
    sectionLabel: "Food & mood",
    title: "Are cravings usually for specific foods?",
    subtitle: "Sweets, chips, fast food, late-night snacks…",
    icon: "🍫",
    validate: (d) =>
      d.emotional.cravingSpecificity ? null : "Please select an option.",
  },
  {
    id: "mood-history",
    section: "eating-mood",
    sectionLabel: "Food & mood",
    title: "Any personal or family history of ADHD, depression, or anxiety?",
    subtitle: "Helps flag reward-system sensitivity — not a diagnosis.",
    icon: "💭",
    validate: (d) =>
      d.emotional.moodHistory ? null : "Please select an option.",
  },
  {
    id: "chair-stand",
    section: "body-strength",
    sectionLabel: "Strength",
    title: "Can you stand up from a chair without using your arms?",
    icon: "🪑",
    validate: (d) =>
      d.muscle.chairStandAbility ? null : "Please select an option.",
  },
  {
    id: "resistance-training",
    section: "body-strength",
    sectionLabel: "Strength",
    title: "How many days per week do you do resistance training?",
    icon: "🏋️",
    validate: (d) =>
      d.muscle.resistanceTrainingDays ? null : "Please select an option.",
  },
  {
    id: "muscle-symptoms",
    section: "body-strength",
    sectionLabel: "Strength",
    title: "Noticed weaker grip, worse posture, or more fatigue on stairs?",
    icon: "💪",
    validate: (d) =>
      d.muscle.muscleLossSymptoms ? null : "Please select an option.",
  },
  {
    id: "orthostatic",
    section: "side-effects",
    sectionLabel: "Side effects",
    title: "Dizziness or racing heart when standing quickly?",
    subtitle: "Or after large meals.",
    icon: "❤️",
    validate: (d) =>
      d.autonomic.orthostaticSymptoms ? null : "Please select an option.",
  },
  {
    id: "heart-rate",
    section: "side-effects",
    sectionLabel: "Side effects",
    title: "Do you know your resting heart rate?",
    subtitle: "Optional — in beats per minute (bpm).",
    icon: "📊",
    optional: true,
    validate: () => null,
  },
  {
    id: "med-intolerance",
    section: "side-effects",
    sectionLabel: "Side effects",
    title: "Ever had severe nausea or vomiting from medications?",
    subtitle: "Anesthesia, antibiotics, opioids, metformin, etc.",
    icon: "⚠️",
    validate: (d) =>
      d.autonomic.medicationIntoleranceHistory
        ? null
        : "Please select an option.",
  },
  {
    id: "genetics",
    section: "genetics",
    sectionLabel: "Genetics",
    title: "Optional: upload your raw DNA file",
    subtitle:
      "23andMe, AncestryDNA, MyHeritage — we only screen dosing-relevant variants.",
    icon: "🧬",
    optional: true,
    validate: () => null,
  },
  {
    id: "review",
    section: "finish",
    sectionLabel: "Almost done",
    title: "Review your answers",
    icon: "✅",
    validate: () => null,
  },
  {
    id: "generate",
    section: "finish",
    sectionLabel: "Report",
    title: "Your precision report is one tap away",
    subtitle:
      "Phenotype, genetic signals, and a suggested titration strategy for your clinician.",
    icon: "📄",
    validate: () => null,
  },
];

/** Active steps after applying skip rules */
export function getActiveSteps(draft: IntakeDraft): StepDefinition[] {
  return INTAKE_STEPS.filter((s) => !s.skip?.(draft));
}

export function getStepIndex(stepId: string, draft: IntakeDraft): number {
  return getActiveSteps(draft).findIndex((s) => s.id === stepId);
}
