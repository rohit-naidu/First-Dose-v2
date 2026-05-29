import type { PrecisionScores } from "@/lib/types";

type ScoreBreakdownProps = {
  scores: PrecisionScores;
};

function ScoreCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#1e3a5f]">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#1e3a5f]">Risk Score Breakdown</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ScoreCard label="Hungry Brain" value={scores.hungryBrainScore} />
        <ScoreCard label="Hungry Gut" value={scores.hungryGutScore} />
        <ScoreCard
          label="Emotional Eating"
          value={scores.emotionalEatingScore}
        />
        <ScoreCard label="Slow Burn" value={scores.slowBurnScore} />
        <ScoreCard label="Sarcopenia Risk" value={scores.sarcopeniaRisk} />
        <ScoreCard label="Autonomic Risk" value={scores.autonomicRisk} />
        <ScoreCard label="Tolerability Brake (T)" value={scores.tolerabilityBrake} />
        <ScoreCard label="Structural Risk (S)" value={scores.structuralRisk} />
        <ScoreCard
          label="Efficacy Score (E)"
          value={scores.efficacyScore}
          sub={`Primary: ${scores.primaryPhenotype}`}
        />
      </div>
      <div className="rounded-xl bg-slate-50 p-4 font-mono text-sm text-slate-800">
        <p>Optimal Titration Velocity = Expected Efficacy / (Tolerability Brake + Structural Risk)</p>
        <p className="mt-2 font-bold text-blue-800">
          V = {scores.efficacyScore} / ({scores.tolerabilityBrake} +{" "}
          {scores.structuralRisk}) = {scores.titrationVelocity}
        </p>
      </div>
    </div>
  );
}
