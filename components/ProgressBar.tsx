type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
  labels: string[];
};

export function ProgressBar({ currentStep, totalSteps, labels }: ProgressBarProps) {
  const pct = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="mb-8">
      <div className="mb-2 flex justify-between text-sm text-slate-600">
        <span>
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-blue-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-sm font-medium text-[#1e3a5f]">
        {labels[currentStep] ?? ""}
      </p>
    </div>
  );
}
