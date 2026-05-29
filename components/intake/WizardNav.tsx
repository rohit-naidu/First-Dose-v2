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
};

export function WizardNav({
  onBack,
  onNext,
  canGoBack,
  showNext,
  showSkip,
  onSkip,
  nextLabel = "Continue",
}: WizardNavProps) {
  return (
    <div className="intake-nav">
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        className="intake-btn-back"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="intake-nav-actions">
        {showSkip && onSkip && (
          <button type="button" onClick={onSkip} className="intake-btn-skip">
            <SkipForward className="h-3.5 w-3.5 inline mr-1" />
            Skip
          </button>
        )}
        {showNext && (
          <button type="button" onClick={onNext} className="intake-btn-continue">
            {nextLabel}
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
