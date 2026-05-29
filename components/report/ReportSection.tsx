import type { ReactNode } from "react";

type ReportSectionProps = {
  roman: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function ReportSection({
  roman,
  title,
  subtitle,
  children,
  className = "",
}: ReportSectionProps) {
  return (
    <section className={`report-section print-break ${className}`}>
      <div className="report-section__head">
        <p className="section-roman">Section {roman}</p>
        <h2>{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      <div className="report-section__body">{children}</div>
    </section>
  );
}
