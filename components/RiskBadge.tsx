type RiskLevel = "low" | "moderate" | "elevated" | "high" | "green" | "yellow" | "orange" | "red";

const STYLES: Record<string, string> = {
  low: "bg-green-100 text-green-800 border-green-200",
  moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  elevated: "bg-orange-100 text-orange-800 border-orange-200",
  high: "bg-red-100 text-red-800 border-red-200",
  green: "bg-green-100 text-green-800 border-green-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  red: "bg-red-100 text-red-800 border-red-200",
};

type RiskBadgeProps = {
  label: string;
  level: RiskLevel;
};

export function RiskBadge({ label, level }: RiskBadgeProps) {
  const style = STYLES[level] ?? STYLES.moderate;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${style}`}
    >
      {label}
    </span>
  );
}
