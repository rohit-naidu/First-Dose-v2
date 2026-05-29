import type { GeneticVariantResult } from "@/lib/types";
import { RiskBadge } from "./RiskBadge";

type VariantResultCardProps = {
  variant: GeneticVariantResult;
};

function statusLabel(status: GeneticVariantResult["status"]): string {
  if (status === "detected") return "Detected";
  if (status === "not_detected") return "Not detected";
  return "Not found in file";
}

function statusLevel(
  status: GeneticVariantResult["status"]
): "low" | "elevated" | "moderate" {
  if (status === "detected") return "elevated";
  if (status === "not_detected") return "low";
  return "moderate";
}

export function VariantResultCard({ variant }: VariantResultCardProps) {
  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold text-[#1e3a5f]">
          {variant.gene} — {variant.rsid}
        </h4>
        <RiskBadge
          label={statusLabel(variant.status)}
          level={statusLevel(variant.status)}
        />
      </div>
      {variant.genotype && (
        <p className="mt-2 text-sm text-slate-600">
          Genotype: {variant.genotype}
        </p>
      )}
      <p className="mt-3 text-sm text-slate-700">{variant.interpretation}</p>
      <p className="mt-2 text-xs text-slate-500 italic">
        Should be interpreted by a clinician. Associations are probabilistic.
      </p>
    </div>
  );
}
