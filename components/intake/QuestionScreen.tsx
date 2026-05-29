"use client";

import type { ReactNode } from "react";
import type { IntakeSection } from "@/lib/intakeSteps";

const SECTION_GRADIENTS: Record<IntakeSection, string> = {
  welcome: "from-violet-500 to-blue-600",
  "about-you": "from-blue-500 to-cyan-500",
  hunger: "from-amber-400 to-orange-500",
  "eating-mood": "from-pink-500 to-rose-500",
  "body-strength": "from-emerald-500 to-teal-600",
  "side-effects": "from-red-400 to-orange-500",
  genetics: "from-indigo-500 to-purple-600",
  finish: "from-blue-600 to-indigo-700",
};

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
  section,
  sectionLabel,
  icon,
  title,
  subtitle,
  helperText,
  children,
  stepNumber,
  totalSteps,
}: QuestionScreenProps) {
  const gradient = SECTION_GRADIENTS[section];

  return (
    <div
      key={stepNumber}
      className="animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div
        className={`mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${gradient} px-4 py-1.5 text-sm font-medium text-white shadow-lg`}
      >
        <span>{sectionLabel}</span>
        <span className="opacity-80">
          {stepNumber} / {totalSteps}
        </span>
      </div>

      <div className="mb-8 flex items-start gap-4">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-3xl shadow-lg`}
        >
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight text-[#1e3a5f] sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-blue-100/50 backdrop-blur sm:p-8">
        {children}
      </div>

      {helperText && (
        <p className="mt-4 text-center text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
}
