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
    <div
      className="retro-locus"
      style={{
        border: "1px solid #1a1814",
        background: "#fffef9",
        padding: "0.65rem 0.75rem",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4
          style={{
            fontWeight: 700,
            fontSize: "0.9rem",
            margin: 0,
          }}
        >
          {variant.gene} — {variant.rsid}
        </h4>
        <RiskBadge
          label={statusLabel(variant.status)}
          level={statusLevel(variant.status)}
        />
      </div>
      {variant.genotype && (
        <p style={{ marginTop: "0.35rem", fontSize: "0.8rem" }}>
          Genotype: {variant.genotype}
        </p>
      )}
      <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", lineHeight: 1.45 }}>
        {variant.interpretation}
      </p>
      <p
        style={{
          marginTop: "0.35rem",
          fontSize: "0.7rem",
          fontStyle: "italic",
          color: "#6b6560",
        }}
      >
        Should be interpreted by a clinician. Associations are probabilistic.
      </p>
    </div>
  );
}
