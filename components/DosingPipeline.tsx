import {
  ClipboardList,
  Brain,
  Utensils,
  Dna,
  Shield,
  Calculator,
  FileText,
} from "lucide-react";

const ICONS = [
  ClipboardList,
  Brain,
  Utensils,
  Dna,
  Shield,
  Calculator,
  FileText,
];

type DosingPipelineProps = {
  steps?: string[];
  orientation?: "horizontal" | "vertical";
};

const DEFAULT_STEPS = [
  "Questionnaire",
  "AI Meal Estimate",
  "Genetic Screen",
  "Risk Scoring",
  "Dosing Equation",
  "Clinician Report",
];

export function DosingPipeline({
  steps = DEFAULT_STEPS,
  orientation = "horizontal",
}: DosingPipelineProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={`flex ${
        isVertical ? "flex-col gap-4" : "flex-wrap items-center justify-between gap-2"
      }`}
    >
      {steps.map((step, i) => {
        const Icon = ICONS[i] ?? FileText;
        return (
          <div
            key={step}
            className={`flex items-center gap-2 ${
              isVertical ? "" : "flex-1 min-w-[100px]"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Step {i + 1}</p>
              <p className="text-sm font-semibold text-[#1e3a5f]">{step}</p>
            </div>
            {!isVertical && i < steps.length - 1 && (
              <span className="hidden sm:inline text-blue-300 mx-1">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
