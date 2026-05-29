"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ChoiceGrid } from "@/components/intake/ChoiceGrid";
import { QuestionScreen } from "@/components/intake/QuestionScreen";
import { WizardNav } from "@/components/intake/WizardNav";
import { WizardProgress } from "@/components/intake/WizardProgress";
import { MealDescriptionBox } from "@/components/MealDescriptionBox";
import { AICalorieEstimateCard } from "@/components/AICalorieEstimateCard";
import { GeneticUploadCard } from "@/components/GeneticUploadCard";
import { createEmptyDraft, type IntakeDraft, type MealEstimate } from "@/lib/types";
import { createDemoDraft } from "@/lib/demoData";
import { getActiveSteps } from "@/lib/intakeSteps";
import { saveDraft, loadDraft, clearDraft, saveIntake } from "@/lib/storage";
import { validateStepIndex, validateReportReady } from "@/lib/validation";
import { finalizeIntake } from "@/lib/reportGenerator";
import { PRODUCT_POSITIONING } from "@/lib/disclaimers";

const inputClass = "intake-input";

export function IntakeWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<IntakeDraft>(createDemoDraft);
  const [error, setError] = useState<string | null>(null);
  const [mealLoading, setMealLoading] = useState(false);
  const [editedCalories, setEditedCalories] = useState<number | "">("");
  const [generating, setGenerating] = useState(false);

  const activeSteps = useMemo(() => getActiveSteps(draft), [draft]);
  const currentStep = activeSteps[stepIndex];

  useEffect(() => {
    if (stepIndex >= activeSteps.length) {
      setStepIndex(Math.max(0, activeSteps.length - 1));
    }
  }, [activeSteps.length, stepIndex]);
  const totalSteps = activeSteps.length;
  const progressPercent = Math.round(((stepIndex + 1) / totalSteps) * 100);

  const applyDemo = useCallback(() => {
    const demo = createDemoDraft();
    setDraft(demo);
    setEditedCalories("");
    setError(null);
    saveDraft(demo);
  }, []);

  useEffect(() => {
    const fresh = searchParams.get("fresh") === "true";
    const stepParam = searchParams.get("step");

    if (fresh) {
      applyDemo();
      return;
    }

    const saved = loadDraft();
    const useSaved =
      saved &&
      saved.patient.name.trim() &&
      !saved.isDemo &&
      !saved.patient.name.includes("(Demo)");

    if (useSaved) {
      setDraft(saved);
      const steps = getActiveSteps(saved);
      if (saved.currentStep != null && saved.currentStep < steps.length) {
        setStepIndex(saved.currentStep);
      }
      if (saved.hunger.userEditedCalories)
        setEditedCalories(saved.hunger.userEditedCalories);
    } else {
      applyDemo();
    }

    if (stepParam === "genetics") {
      const idx = getActiveSteps(saved ?? createDemoDraft()).findIndex(
        (s) => s.id === "genetics"
      );
      if (idx >= 0) setStepIndex(idx);
    }
  }, [searchParams, applyDemo]);

  const persist = useCallback(
    (next: IntakeDraft, idx?: number) => {
      const withStep = { ...next, currentStep: idx ?? stepIndex };
      setDraft(withStep);
      saveDraft(withStep);
    },
    [stepIndex]
  );

  const updateDraft = (patch: Partial<IntakeDraft>) => {
    persist({ ...draft, ...patch });
  };

  const goToStep = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, totalSteps - 1));
    setStepIndex(clamped);
    persist(draft, clamped);
    setError(null);
  };

  const goNext = () => {
    const v = validateStepIndex(stepIndex, draft);
    if (!v.valid) {
      setError(v.errors[0] ?? "Please complete this question.");
      return;
    }
    setError(null);
    goToStep(stepIndex + 1);
  };

  const goBack = () => goToStep(stepIndex - 1);

  const skipOptional = () => goToStep(stepIndex + 1);

  const estimateMeal = async () => {
    setMealLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: draft.hunger.mealDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const estimate: MealEstimate = {
        totalCalories: data.estimatedCalories,
        confidence: data.confidence,
        items: data.items ?? [],
        assumptions: data.assumptions ?? [],
        interpretation: data.interpretation ?? data.satietyInterpretation,
      };
      updateDraft({
        hunger: {
          ...draft.hunger,
          aiEstimatedCalories: estimate.totalCalories,
          calorieEstimateConfidence: estimate.confidence,
          mealEstimate: estimate,
        },
      });
      setEditedCalories("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not estimate calories. Enter a number manually below."
      );
    } finally {
      setMealLoading(false);
    }
  };

  const generateReport = () => {
    const v = validateReportReady(draft);
    if (!v.valid) {
      setError(v.errors[0] ?? "Please complete required questions.");
      return;
    }
    setGenerating(true);
    try {
      const intake = finalizeIntake({
        ...draft,
        genetics: {
          ...draft.genetics,
          uploaded: draft.genetics.variants.length > 0,
        },
        hunger: {
          ...draft.hunger,
          userEditedCalories:
            editedCalories !== "" ? editedCalories : draft.hunger.userEditedCalories,
        },
      });
      saveIntake(intake);
      clearDraft();
      router.push(`/report/${intake.id}`);
    } catch {
      setError("Failed to generate report.");
      setGenerating(false);
    }
  };

  const jumpToGenerate = () => {
    const idx = activeSteps.findIndex((s) => s.id === "generate");
    if (idx >= 0) goToStep(idx);
  };

  const loadEmptyForm = () => {
    const empty = createEmptyDraft();
    setDraft(empty);
    setEditedCalories("");
    setError(null);
    setStepIndex(0);
    saveDraft(empty);
  };

  if (!currentStep) return null;

  const screenProps = {
    section: currentStep.section,
    sectionLabel: currentStep.sectionLabel,
    icon: currentStep.icon,
    title: currentStep.title,
    subtitle: currentStep.subtitle,
    helperText: currentStep.helperText,
    stepNumber: stepIndex + 1,
    totalSteps,
  };

  const renderBody = () => {
    switch (currentStep.id) {
      case "welcome":
        return (
          <div className="text-center">
            <div className="intake-welcome-icon">
              <Sparkles className="h-8 w-8" />
            </div>
            <p className="leading-relaxed" style={{ fontSize: "0.9rem" }}>
              Takes about 5–7 minutes. One question per screen — tap your answer
              and continue. Your data stays on this device until you generate a
              report.
            </p>
            <ul className="intake-welcome-list">
              {[
                "No medical advice — built for your clinician",
                "Optional genetic upload",
                "AI meal calorie estimate included",
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        );

      case "name":
        return (
          <input
            className={inputClass}
            placeholder="e.g. Jordan Rivera"
            autoFocus
            value={draft.patient.name}
            onChange={(e) =>
              updateDraft({ patient: { ...draft.patient, name: e.target.value } })
            }
          />
        );

      case "dob":
        return (
          <input
            type="date"
            className={inputClass}
            value={draft.patient.dateOfBirth}
            onChange={(e) =>
              updateDraft({
                patient: { ...draft.patient, dateOfBirth: e.target.value },
              })
            }
          />
        );

      case "sex":
        return (
          <ChoiceGrid
            value={draft.patient.sex}
            onChange={(v) =>
              updateDraft({ patient: { ...draft.patient, sex: v } })
            }
            choices={[
              { value: "female", label: "Female", emoji: "♀️" },
              { value: "male", label: "Male", emoji: "♂️" },
              { value: "other", label: "Other / prefer not to say", emoji: "🌈" },
            ]}
          />
        );

      case "height":
        return (
          <div>
            <input
              type="number"
              className={inputClass}
              placeholder="e.g. 168"
              value={draft.patient.heightCm || ""}
              onChange={(e) =>
                updateDraft({
                  patient: {
                    ...draft.patient,
                    heightCm: Number(e.target.value) || 0,
                  },
                })
              }
            />
            <p className="intake-input-hint">centimeters (cm)</p>
          </div>
        );

      case "weight":
        return (
          <div>
            <input
              type="number"
              className={inputClass}
              placeholder="e.g. 85"
              value={draft.patient.weightKg || ""}
              onChange={(e) =>
                updateDraft({
                  patient: {
                    ...draft.patient,
                    weightKg: Number(e.target.value) || 0,
                  },
                })
              }
            />
            <p className="intake-input-hint">kilograms (kg)</p>
          </div>
        );

      case "goal-weight":
        return (
          <input
            type="number"
            className={inputClass}
            placeholder="Optional — e.g. 72"
            value={draft.patient.goalWeightKg ?? ""}
            onChange={(e) =>
              updateDraft({
                patient: {
                  ...draft.patient,
                  goalWeightKg: Number(e.target.value) || undefined,
                },
              })
            }
          />
        );

      case "medication":
        return (
          <ChoiceGrid
            value={draft.patient.currentMedicationStatus}
            onChange={(v) =>
              updateDraft({
                patient: { ...draft.patient, currentMedicationStatus: v },
              })
            }
            choices={[
              { value: "Not started", label: "Not started yet", emoji: "🆕" },
              { value: "Semaglutide", label: "Semaglutide", emoji: "💊" },
              { value: "Tirzepatide", label: "Tirzepatide", emoji: "💊" },
              { value: "Liraglutide", label: "Liraglutide", emoji: "💊" },
              { value: "Other", label: "Other GLP-1", emoji: "📋" },
            ]}
          />
        );

      case "dose":
        return (
          <input
            className={inputClass}
            placeholder="e.g. 2.5 mg weekly"
            value={draft.patient.currentDose ?? ""}
            onChange={(e) =>
              updateDraft({
                patient: { ...draft.patient, currentDose: e.target.value },
              })
            }
          />
        );

      case "months-on-med":
        return (
          <ChoiceGrid
            value={draft.patient.monthsOnMedication ?? ""}
            onChange={(v) =>
              updateDraft({
                patient: { ...draft.patient, monthsOnMedication: v },
              })
            }
            choices={[
              { value: "Less than 4 weeks", label: "Less than 4 weeks" },
              { value: "1–3 months", label: "1–3 months" },
              { value: "3–6 months", label: "3–6 months" },
              { value: "6+ months", label: "6+ months" },
            ]}
          />
        );

      case "primary-goal":
        return (
          <ChoiceGrid
            value={draft.patient.primaryGoal}
            onChange={(v) =>
              updateDraft({ patient: { ...draft.patient, primaryGoal: v } })
            }
            choices={[
              { value: "weight loss", label: "Weight loss", emoji: "📉" },
              {
                value: "reduced side effects",
                label: "Fewer side effects",
                emoji: "🛡️",
              },
              {
                value: "restart after intolerance",
                label: "Restart after intolerance",
                emoji: "🔄",
              },
              {
                value: "switch medication",
                label: "Switch medication",
                emoji: "↔️",
              },
              {
                value: "maintenance dosing",
                label: "Maintenance dosing",
                emoji: "⚖️",
              },
              {
                value: "muscle preservation",
                label: "Preserve muscle",
                emoji: "💪",
              },
            ]}
          />
        );

      case "meal-description":
        return (
          <MealDescriptionBox
            value={draft.hunger.mealDescription}
            onChange={(v) =>
              updateDraft({ hunger: { ...draft.hunger, mealDescription: v } })
            }
            onEstimate={estimateMeal}
            loading={mealLoading}
          />
        );

      case "meal-calories":
        return (
          <div className="space-y-4">
            {!draft.hunger.mealEstimate && (
              <button
                type="button"
                onClick={estimateMeal}
                disabled={mealLoading || !draft.hunger.mealDescription.trim()}
                className="intake-btn-primary"
              >
                {mealLoading ? "Estimating…" : "✨ Estimate calories with AI"}
              </button>
            )}
            <AICalorieEstimateCard
              estimate={draft.hunger.mealEstimate ?? null}
              editedCalories={editedCalories}
              onEditCalories={(v) => {
                setEditedCalories(v);
                updateDraft({
                  hunger: {
                    ...draft.hunger,
                    userEditedCalories: v === "" ? undefined : v,
                  },
                });
              }}
            />
          </div>
        );

      case "fullness-duration":
        return (
          <ChoiceGrid
            value={draft.hunger.fullnessDuration}
            onChange={(v) =>
              updateDraft({ hunger: { ...draft.hunger, fullnessDuration: v } })
            }
            choices={[
              {
                value: "Less than 1 hour",
                label: "Less than 1 hour",
                description: "Hungry again quickly",
                emoji: "⚡",
              },
              { value: "1–2 hours", label: "1–2 hours", emoji: "🕐" },
              { value: "2–4 hours", label: "2–4 hours", emoji: "🕑" },
              { value: "4+ hours", label: "4+ hours", emoji: "✅" },
            ]}
          />
        );

      case "food-noise":
        return (
          <ChoiceGrid
            value={draft.emotional.foodNoiseFrequency}
            onChange={(v) =>
              updateDraft({
                emotional: { ...draft.emotional, foodNoiseFrequency: v },
              })
            }
            choices={[
              { value: "Never", label: "Never", emoji: "😌" },
              { value: "Sometimes", label: "Sometimes", emoji: "😐" },
              { value: "Often", label: "Often", emoji: "😣" },
              { value: "Almost always", label: "Almost always", emoji: "🔥" },
            ]}
          />
        );

      case "cravings":
        return (
          <ChoiceGrid
            value={draft.emotional.cravingSpecificity}
            onChange={(v) =>
              updateDraft({
                emotional: { ...draft.emotional, cravingSpecificity: v },
              })
            }
            choices={[
              { value: "No", label: "No", emoji: "👍" },
              { value: "Mildly", label: "Mildly", emoji: "🤏" },
              { value: "Yes, strongly", label: "Yes, strongly", emoji: "🍟" },
              {
                value: "Yes, and it feels hard to interrupt",
                label: "Hard to stop once I start",
                emoji: "🔄",
              },
            ]}
          />
        );

      case "mood-history":
        return (
          <ChoiceGrid
            value={draft.emotional.moodHistory}
            onChange={(v) =>
              updateDraft({
                emotional: { ...draft.emotional, moodHistory: v },
              })
            }
            choices={[
              { value: "No", label: "No history", emoji: "✓" },
              { value: "Personal history", label: "Personal history", emoji: "🧑" },
              { value: "Family history", label: "Family history", emoji: "👨‍👩‍👧" },
              {
                value: "Both personal and family history",
                label: "Both",
                emoji: "📋",
              },
            ]}
          />
        );

      case "chair-stand":
        return (
          <ChoiceGrid
            value={draft.muscle.chairStandAbility}
            onChange={(v) =>
              updateDraft({ muscle: { ...draft.muscle, chairStandAbility: v } })
            }
            choices={[
              { value: "Yes, easily", label: "Yes, easily", emoji: "💪" },
              {
                value: "Yes, but with effort",
                label: "Yes, with effort",
                emoji: "😅",
              },
              { value: "No", label: "No", emoji: "🪑" },
              { value: "Not sure", label: "Not sure", emoji: "🤷" },
            ]}
          />
        );

      case "resistance-training":
        return (
          <ChoiceGrid
            value={draft.muscle.resistanceTrainingDays}
            onChange={(v) =>
              updateDraft({
                muscle: { ...draft.muscle, resistanceTrainingDays: v },
              })
            }
            columns={2}
            choices={[
              { value: "0", label: "0 days", emoji: "0️⃣" },
              { value: "1", label: "1 day", emoji: "1️⃣" },
              { value: "2–3", label: "2–3 days", emoji: "2️⃣" },
              { value: "4+", label: "4+ days", emoji: "4️⃣" },
            ]}
          />
        );

      case "muscle-symptoms":
        return (
          <ChoiceGrid
            value={draft.muscle.muscleLossSymptoms}
            onChange={(v) =>
              updateDraft({
                muscle: { ...draft.muscle, muscleLossSymptoms: v },
              })
            }
            choices={[
              { value: "No", label: "No", emoji: "✅" },
              { value: "Mildly", label: "Mildly", emoji: "〰️" },
              { value: "Yes", label: "Yes", emoji: "⚠️" },
              {
                value: "Yes, significantly",
                label: "Yes, significantly",
                emoji: "🔴",
              },
            ]}
          />
        );

      case "orthostatic":
        return (
          <ChoiceGrid
            value={draft.autonomic.orthostaticSymptoms}
            onChange={(v) =>
              updateDraft({
                autonomic: { ...draft.autonomic, orthostaticSymptoms: v },
              })
            }
            choices={[
              { value: "Never", label: "Never", emoji: "✅" },
              { value: "Rarely", label: "Rarely", emoji: "🙂" },
              { value: "Sometimes", label: "Sometimes", emoji: "😵‍💫" },
              { value: "Often", label: "Often", emoji: "❤️‍🔥" },
            ]}
          />
        );

      case "heart-rate":
        return (
          <div>
            <input
              type="number"
              className={inputClass}
              placeholder="e.g. 72 (optional)"
              value={draft.autonomic.restingHeartRate ?? ""}
              onChange={(e) =>
                updateDraft({
                  autonomic: {
                    ...draft.autonomic,
                    restingHeartRate: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  },
                })
              }
            />
            <p className="intake-input-hint">beats per minute</p>
          </div>
        );

      case "med-intolerance":
        return (
          <ChoiceGrid
            value={draft.autonomic.medicationIntoleranceHistory}
            onChange={(v) =>
              updateDraft({
                autonomic: {
                  ...draft.autonomic,
                  medicationIntoleranceHistory: v,
                },
              })
            }
            choices={[
              { value: "No", label: "No", emoji: "✅" },
              { value: "Mild nausea only", label: "Mild nausea only", emoji: "🤢" },
              { value: "Vomiting once", label: "Vomiting once", emoji: "😣" },
              {
                value: "Persistent vomiting or severe reaction",
                label: "Severe or persistent",
                emoji: "🚨",
              },
            ]}
          />
        );

      case "genetics":
        return (
          <GeneticUploadCard
            consentGiven={draft.genetics.consentGiven}
            onConsentChange={(v) =>
              updateDraft({ genetics: { ...draft.genetics, consentGiven: v } })
            }
            variants={draft.genetics.variants}
            compoundRisk={draft.genetics.compoundRisk}
            sourceFormat={draft.genetics.sourceFormat}
            onParsed={(data) =>
              updateDraft({
                genetics: {
                  ...draft.genetics,
                  uploaded: true,
                  variants: data.variants,
                  sourceFormat: data.sourceFormat,
                  compoundRisk: data.compoundRisk,
                },
              })
            }
          />
        );

      case "review":
        return (
          <div>
            {[
              ["Name", draft.patient.name],
              ["Medication", draft.patient.currentMedicationStatus],
              ["Fullness", draft.hunger.fullnessDuration],
              [
                "Calories at fullness",
                String(
                  draft.hunger.userEditedCalories ??
                    draft.hunger.aiEstimatedCalories ??
                    "—"
                ),
              ],
              [
                "Genetics",
                draft.genetics.variants.length
                  ? `${draft.genetics.variants.filter((v) => v.status === "detected").length} signal(s)`
                  : "Skipped",
              ],
            ].map(([label, val]) => (
              <dl key={label} className="intake-review-row">
                <dt>{label}</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>{val}</dd>
              </dl>
            ))}
            <p className="intake-helper" style={{ textAlign: "left", marginTop: "0.75rem" }}>
              {PRODUCT_POSITIONING}
            </p>
          </div>
        );

      case "generate":
        return (
          <div className="intake-generate-panel">
            <div className="intake-welcome-icon" style={{ marginBottom: "1rem" }}>
              <span style={{ fontSize: "2rem" }} aria-hidden>
                📄
              </span>
            </div>
            <p>
              Your answers will be scored and formatted as a clinician-ready
              precision dosing report — same chart style as the final document.
            </p>
            <button
              type="button"
              onClick={generateReport}
              disabled={generating}
              className="intake-btn-generate"
              style={{ marginTop: "1.25rem" }}
            >
              {generating ? "Building your report…" : "Generate Clinician Report"}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const isOptional = currentStep.optional;
  const isGenerate = currentStep.id === "generate";
  const showNavNext = !isGenerate;

  return (
    <div className="intake-clinical-page">
      <div className="intake-clinical-shell">
        <div className="intake-clinical-header">
          <strong>GLP-1 Precision Intake</strong>
          <span>Confidential · Local storage</span>
        </div>

        <Link href="/" className="intake-home-link no-print">
          ← Home
        </Link>

        <div className="intake-demo-bar no-print">
          <span>Demo pre-filled — edit or start fresh</span>
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            <button type="button" onClick={applyDemo} className="intake-btn-back">
              Reset demo
            </button>
            <button type="button" onClick={loadEmptyForm} className="intake-btn-skip">
              Empty form
            </button>
            <button type="button" onClick={jumpToGenerate} className="intake-btn-continue">
              Skip to report
            </button>
          </div>
        </div>

        <WizardProgress
          currentSection={currentStep.section}
          progressPercent={progressPercent}
          stepNumber={stepIndex + 1}
          totalSteps={totalSteps}
        />

        <div className="intake-form-card">
          <QuestionScreen {...screenProps}>{renderBody()}</QuestionScreen>

          {error && <p className="intake-error">{error}</p>}

          {!isGenerate && (
          <WizardNav
            onBack={goBack}
            onNext={
              currentStep.id === "welcome"
                ? goNext
                : currentStep.id === "review"
                  ? () => {
                      const v = validateReportReady(draft);
                      if (!v.valid) {
                        setError(v.errors[0] ?? "Please complete required fields.");
                        return;
                      }
                      goNext();
                    }
                  : goNext
            }
            canGoBack={stepIndex > 0}
            showNext={showNavNext}
            showSkip={isOptional}
            onSkip={skipOptional}
            nextLabel={currentStep.id === "welcome" ? "Let's begin" : "Continue"}
          />
          )}
        </div>
      </div>
    </div>
  );
}
