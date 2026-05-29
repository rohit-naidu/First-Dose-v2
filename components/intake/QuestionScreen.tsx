"use client";

import type { ReactNode } from "react";
import type { IntakeSection } from "@/lib/intakeSteps";

type QuestionScreenProps = {
  section: IntakeSection;
  sectionLabel: string;
  icon: string;
  title: string;
  subtitle?: string;
  helperText?: string;
  children: ReactNode;
  stepNumber: number;
  totalSteps: number;
};

export function QuestionScreen({
  sectionLabel,
  icon,
  title,
  subtitle,
  helperText,
  children,
  stepNumber,
  totalSteps,
}: QuestionScreenProps) {
  return (
    <div className="intake-question" key={stepNumber}>
      <div className="intake-section-badge">
        <span>{sectionLabel}</span>
        <span>
          {stepNumber} / {totalSteps}
        </span>
      </div>

      <div className="intake-question-head">
        <div className="intake-question-icon" aria-hidden>
          {icon}
        </div>
        <div>
          <h1 className="intake-question-title">{title}</h1>
          {subtitle && <p className="intake-question-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="intake-answer-panel">{children}</div>

      {helperText && <p className="intake-helper">{helperText}</p>}
    </div>
  );
}
