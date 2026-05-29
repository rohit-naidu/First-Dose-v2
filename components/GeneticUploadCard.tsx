"use client";

import { useCallback, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import type { GeneticVariantResult, GeneticSourceFormat } from "@/lib/types";
import { GENETIC_DISCLAIMER, GENETIC_PRIVACY } from "@/lib/disclaimers";
import { VariantResultCard } from "./VariantResultCard";

type GeneticUploadCardProps = {
  consentGiven: boolean;
  onConsentChange: (v: boolean) => void;
  variants: GeneticVariantResult[];
  compoundRisk?: boolean;
  sourceFormat?: GeneticSourceFormat;
  onParsed: (data: {
    variants: GeneticVariantResult[];
    sourceFormat: GeneticSourceFormat;
    compoundRisk: boolean;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!consentGiven) {
        setError("Please consent to genetic screening before uploading.");
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("consent", "true");
        const res = await fetch("/api/parse-genetics", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        onParsed({
          variants: data.variants,
          sourceFormat: data.sourceFormat,
          compoundRisk: data.compoundRisk,
        });
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Unable to read this genetic file. Please upload raw genotype data from 23andMe, AncestryDNA, MyHeritage, or another provider."
        );
      } finally {
        setLoading(false);
      }
    },
    [consentGiven, onParsed]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="space-y-6">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={consentGiven}
          onChange={(e) => onConsentChange(e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm text-slate-700">
          I consent to genetic variant screening for GLP-1 tolerability and
          dosing-support purposes.
        </span>
      </label>

      <p className="text-sm text-slate-500">{GENETIC_PRIVACY}</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
          dragOver
            ? "border-blue-400 bg-blue-50"
            : "border-blue-200 bg-white"
        } ${!consentGiven ? "opacity-50 pointer-events-none" : ""}`}
      >
        <Upload className="mx-auto h-10 w-10 text-blue-400" />
        <p className="mt-4 font-medium text-slate-700">
          Drag and drop your raw DNA file here
        </p>
        <p className="text-slate-500">or</p>
        <label className="mt-4 inline-block cursor-pointer rounded-xl bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
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
        <p className="mt-4 text-xs text-slate-500">
          Supported: .txt, .csv, .tsv, .zip — 23andMe, AncestryDNA, MyHeritage,
          FamilyTreeDNA
        </p>
        {loading && (
          <p className="mt-4 flex items-center justify-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Parsing genetic file…
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {variants.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[#1e3a5f]">
            {variants.some((v) => v.status === "detected")
              ? "Genetic Tolerability Signals Detected"
              : "Genetic Variant Screen Results"}
          </h3>
          {compoundRisk && (
            <div className="mt-3">
              <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-800 border border-orange-200">
                Compound tolerability risk
              </span>
            </div>
          )}
          {sourceFormat && (
            <p className="mt-2 text-sm text-slate-500">
              Detected format: {sourceFormat}
            </p>
          )}
          <div className="mt-4 space-y-4">
            {variants.map((v) => (
              <VariantResultCard key={v.rsid} variant={v} />
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">{GENETIC_DISCLAIMER}</p>
        </div>
      )}
    </div>
  );
}
