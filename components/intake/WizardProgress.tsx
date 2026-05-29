"use client";

import type { IntakeSection } from "@/lib/intakeSteps";
import { SECTION_ORDER } from "@/lib/intakeSteps";

type WizardProgressProps = {
  currentSection: IntakeSection;
  progressPercent: number;
  stepNumber: number;
  totalSteps: number;
};

const SECTION_LABELS: Record<IntakeSection, string> = {
  welcome: "Start",
  "about-you": "You",
  hunger: "Hunger",
  "eating-mood": "Mood",
  "body-strength": "Strength",
  "side-effects": "Safety",
  genetics: "DNA",
  finish: "Report",
};

export function WizardProgress({
  currentSection,
  progressPercent,
  stepNumber,
  totalSteps,
}: WizardProgressProps) {
  const currentIdx = SECTION_ORDER.indexOf(currentSection);

  return (
    <div className="intake-progress">
      <div className="intake-progress__meta">
        <span>Precision intake</span>
        <span>
          Question {stepNumber} of {totalSteps}
        </span>
      </div>
      <div className="intake-progress__bar">
        <div
          className="intake-progress__fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="intake-progress__sections">
        {SECTION_ORDER.map((section, i) => {
          const active = i === currentIdx;
          const done = i < currentIdx;
          return (
            <div
              key={section}
              className={`intake-progress__dot ${
                active ? "intake-progress__dot--active" : done ? "intake-progress__dot--done" : ""
              }`}
            >
              <span>{SECTION_LABELS[section]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
