import type { IntakeDraft } from "./types";
import { getActiveSteps } from "./intakeSteps";

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

/** Validate a single wizard step by index (active steps only) */
export function validateStepIndex(
  stepIndex: number,
  draft: IntakeDraft
): ValidationResult {
  const steps = getActiveSteps(draft);
  const step = steps[stepIndex];
  if (!step) return { valid: true, errors: [] };

  const err = step.validate(draft);
  if (err) return { valid: false, errors: [err] };
  return { valid: true, errors: [] };
}

/** Full validation before report generation */
export function validateReportReady(draft: IntakeDraft): ValidationResult {
  const steps = getActiveSteps(draft);
  const errors: string[] = [];
  const skipIds = new Set(["welcome", "review", "generate", "genetics", "heart-rate", "goal-weight", "dose", "months-on-med"]);

  for (const step of steps) {
    if (skipIds.has(step.id)) continue;
    if (step.optional && step.id !== "meal-calories") continue;
    const err = step.validate(draft);
    if (err) errors.push(err);
  }

  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}

/** @deprecated Use validateStepIndex — kept for API route compatibility */
export function validateStep(step: number, draft: IntakeDraft): ValidationResult {
  return validateStepIndex(step, draft);
}
