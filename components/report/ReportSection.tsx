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
    <section
      className={`print-break scroll-mt-8 rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}
    >
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4 sm:px-8">
        <p className="text-xs font-bold tracking-widest text-blue-600 uppercase">
          Section {roman}
        </p>
        <h2 className="mt-1 text-xl font-bold text-[#1e3a5f] sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
      </div>
      <div className="px-6 py-6 sm:px-8">{children}</div>
    </section>
  );
}
