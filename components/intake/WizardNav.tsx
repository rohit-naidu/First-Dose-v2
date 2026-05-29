"use client";

import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";

type WizardNavProps = {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  showNext: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
  nextLabel?: string;
  isLastContentStep?: boolean;
};

export function WizardNav({
  onBack,
  onNext,
  canGoBack,
  showNext,
  showSkip,
  onSkip,
  nextLabel = "Continue",
  isLastContentStep,
}: WizardNavProps) {
  return (
    <div className="no-print mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-6 py-3.5 font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="h-5 w-5" />
        Back
      </button>

      <div className="flex flex-col gap-2 sm:flex-row">
        {showSkip && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 px-5 py-3.5 text-sm font-medium text-slate-500 hover:border-blue-300 hover:text-blue-600"
          >
            <SkipForward className="h-4 w-4" />
            Skip for now
          </button>
        )}
        {showNext && (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-3.5 text-lg font-semibold text-white shadow-lg shadow-blue-200/60 transition hover:shadow-xl hover:brightness-105 active:scale-[0.98]"
          >
            {isLastContentStep ? "Generate report" : nextLabel}
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
