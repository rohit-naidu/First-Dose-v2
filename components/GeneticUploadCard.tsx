"use client";

import { useState, useCallback } from "react";
import { Upload, Loader2 } from "lucide-react";
import { VariantResultCard } from "@/components/VariantResultCard";
import type { GeneticSourceFormat, GeneticVariantResult } from "@/lib/types";
import { GENETIC_DISCLAIMER, GENETIC_PRIVACY } from "@/lib/disclaimers";

type GeneticUploadCardProps = {
  consentGiven: boolean;
  onConsentChange: (value: boolean) => void;
  variants: GeneticVariantResult[];
  compoundRisk?: boolean;
  sourceFormat?: GeneticSourceFormat;
  onParsed: (data: {
    variants: GeneticVariantResult[];
    sourceFormat?: GeneticSourceFormat;
    compoundRisk?: boolean;
  }) => void;
};

export function GeneticUploadCard({
  consentGiven,
  onConsentChange,
  variants,
  compoundRisk,
  sourceFormat,
  onParsed,
}: GeneticUploadCardProps) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/parse-genetics", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Parse failed");
        onParsed({
          variants: data.variants,
          sourceFormat: data.sourceFormat,
          compoundRisk: data.compoundRisk,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to parse file");
      } finally {
        setLoading(false);
      }
    },
    [onParsed]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (!consentGiven) return;
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [consentGiven, uploadFile]
  );

  return (
    <div className="space-y-6">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={consentGiven}
          onChange={(e) => onConsentChange(e.target.checked)}
          className="mt-1"
          style={{ accentColor: "#1a1814" }}
        />
        <span style={{ fontSize: "0.85rem", lineHeight: 1.45 }}>
          I consent to genetic variant screening for GLP-1 tolerability and
          dosing-support purposes.
        </span>
      </label>

      <p style={{ fontSize: "0.75rem", fontStyle: "italic", color: "#5c574f" }}>
        {GENETIC_PRIVACY}
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`intake-upload-zone ${dragOver ? "intake-upload-zone--active" : ""} ${
          !consentGiven ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <Upload className="mx-auto h-10 w-10" style={{ color: "#1a1814" }} />
        <p style={{ marginTop: "1rem", fontWeight: 600 }}>
          Drag and drop your raw DNA file here
        </p>
        <p style={{ fontSize: "0.85rem", color: "#5c574f" }}>or</p>
        <label className="intake-btn-primary" style={{ cursor: "pointer" }}>
          Choose file
          <input
            type="file"
            className="hidden"
            accept=".txt,.csv,.tsv,.zip"
            disabled={!consentGiven || loading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f);
            }}
          />
        </label>
        <p style={{ marginTop: "1rem", fontSize: "0.7rem", color: "#6b6560" }}>
          Supported: .txt, .csv, .tsv, .zip — 23andMe, AncestryDNA, MyHeritage,
          FamilyTreeDNA
        </p>
        {loading && (
          <p
            style={{
              marginTop: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem",
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.75rem",
            }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Parsing genetic file…
          </p>
        )}
      </div>

      {error && <p className="intake-error">{error}</p>}

      {variants.length > 0 && (
        <div className="intake-genetic-results">
          <h3
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {variants.some((v) => v.status === "detected")
              ? "Genetic tolerability signals detected"
              : "Genetic variant screen results"}
          </h3>
          {compoundRisk && (
            <div style={{ marginTop: "0.5rem" }}>
              <span
                style={{
                  display: "inline-block",
                  border: "1px solid #8b2500",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  background: "#fff5f0",
                  color: "#8b2500",
                }}
              >
                Compound tolerability risk
              </span>
            </div>
          )}
          {sourceFormat && (
            <p style={{ marginTop: "0.35rem", fontSize: "0.75rem", color: "#6b6560" }}>
              Detected format: {sourceFormat}
            </p>
          )}
          <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {variants.map((v) => (
              <VariantResultCard key={v.rsid} variant={v} />
            ))}
          </div>
          <p className="intake-helper" style={{ textAlign: "left", marginTop: "0.65rem" }}>
            {GENETIC_DISCLAIMER}
          </p>
        </div>
      )}
    </div>
  );
}
