import type { ReactNode } from "react";

type QuestionCardProps = {
  title: string;
  subtitle?: string;
  helperText?: string;
  children: ReactNode;
};

export function QuestionCard({
  title,
  subtitle,
  helperText,
  children,
}: QuestionCardProps) {
  return (
    <div className="card-clinical">
      <h2 className="heading-navy text-xl font-semibold">{title}</h2>
      {subtitle && (
        <p className="mt-2 text-slate-600">{subtitle}</p>
      )}
      <div className="mt-6 space-y-4">{children}</div>
      {helperText && (
        <p className="mt-4 text-sm text-slate-500">{helperText}</p>
      )}
    </div>
  );
}
