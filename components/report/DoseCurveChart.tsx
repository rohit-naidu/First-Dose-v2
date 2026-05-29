"use client";

import type { ProtocolType } from "@/lib/types";

type DoseCurveChartProps = {
  protocol: ProtocolType;
};

/** Generate cumulative dose % by week for standard vs precision curves */
function buildCurves(protocol: ProtocolType) {
  const weeks = Array.from({ length: 13 }, (_, i) => i);
  const standard = weeks.map((w) => {
    if (w === 0) return 5;
    if (w <= 4) return 20 + w * 18;
    if (w <= 8) return 75 + (w - 4) * 5;
    return Math.min(100, 95 + (w - 8) * 1);
  });
  const precision = weeks.map((w) => {
    const slow = protocol === "microdosing" ? 0.35 : protocol === "gradual_adaptive" ? 0.55 : 0.75;
    if (w === 0) return 3;
    return Math.min(100, 3 + w * (8 * slow));
  });
  return { weeks, standard, precision };
}

export function DoseCurveChart({ protocol }: DoseCurveChartProps) {
  const { weeks, standard, precision } = buildCurves(protocol);
  const w = 520;
  const h = 220;
  const pad = { l: 44, r: 16, t: 20, b: 36 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  const toX = (i: number) => pad.l + (i / 12) * innerW;
  const toY = (v: number) => pad.t + innerH - (v / 100) * innerH;

  const line = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-700">
        Dose accumulation curve (relative exposure index)
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Dose curves">
        {/* grid */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1={pad.l}
              x2={w - pad.r}
              y1={toY(v)}
              y2={toY(v)}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
            <text x={8} y={toY(v) + 4} fontSize={10} fill="#94a3b8">
              {v}%
            </text>
          </g>
        ))}
        <path d={line(standard)} fill="none" stroke="#94a3b8" strokeWidth={2.5} strokeDasharray="6 4" />
        <path d={line(precision)} fill="none" stroke="#2563eb" strokeWidth={3} />
        {weeks.map((w, i) =>
          i % 2 === 0 ? (
            <text key={w} x={toX(i)} y={h - 8} fontSize={10} fill="#64748b" textAnchor="middle">
              W{w}
            </text>
          ) : null
        )}
      </svg>
      <div className="mt-3 flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-8 border-t-2 border-dashed border-slate-400" />
          Standard (4-week steps)
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1 w-8 rounded bg-blue-600" />
          Precision (symptom-guided)
        </span>
      </div>
    </div>
  );
}
