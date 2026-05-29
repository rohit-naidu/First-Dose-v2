"use client";

import type { IntakeSection } from "@/lib/intakeSteps";
import { SECTION_ORDER } from "@/lib/intakeSteps";

type WizardProgressProps = {
  currentSection: IntakeSection;
  progressPercent: number;
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
}: WizardProgressProps) {
  const currentIdx = SECTION_ORDER.indexOf(currentSection);

  return (
    <div className="sticky top-0 z-20 -mx-4 border-b border-blue-100/80 bg-white/90 px-4 py-4 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:px-6">
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="flex justify-between gap-1 overflow-x-auto pb-1">
        {SECTION_ORDER.map((section, i) => {
          const active = i === currentIdx;
          const done = i < currentIdx;
          return (
            <div
              key={section}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 ${
                i > 0 ? "border-l border-slate-100 pl-1" : ""
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full transition ${
                  active
                    ? "scale-125 bg-blue-500 ring-4 ring-blue-100"
                    : done
                      ? "bg-blue-400"
                      : "bg-slate-200"
                }`}
              />
              <span
                className={`truncate text-[10px] font-medium sm:text-xs ${
                  active ? "text-blue-700" : done ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {SECTION_LABELS[section]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
