import type { GeneticSourceFormat, GeneticVariantResult, GeneticVariantStatus } from "./types";

/** Target variants to screen per product spec */
export const TARGET_VARIANTS = [
  {
    rsid: "rs10305420",
    gene: "GLP1R",
    medicationRelevance:
      "GLP-1 receptor response and nausea/vomiting sensitivity",
    riskType: "emetic_tolerability",
    riskWeight: 1.0,
    /** Risk alleles for detection (simplified MVP model) */
    riskAlleles: ["A", "G"],
    interpretation:
      "May indicate increased sensitivity to GLP-1 receptor activation and higher nausea/vomiting risk. Consider slower titration.",
  },
  {
    rsid: "rs1800437",
    gene: "GIPR",
    medicationRelevance:
      "tirzepatide/GIP pathway tolerability and vomiting risk",
    riskType: "tirzepatide_tolerability",
    riskWeight: 1.0,
    riskAlleles: ["T", "C"],
    interpretation:
      "Relevant for tirzepatide/GIP pathway tolerability. If detected, clinician may consider slower dose escalation.",
  },
] as const;

const MAX_FILE_BYTES = 50 * 1024 * 1024;

export type ParseGeneticsResult = {
  sourceFormat: GeneticSourceFormat;
  variants: GeneticVariantResult[];
  compoundRisk: boolean;
};

/** Detect source format from header lines */
function detectSourceFormat(lines: string[]): GeneticSourceFormat {
  const header = lines.find((l) => l.startsWith("#") || l.toLowerCase().includes("rsid"));
  if (!header) return "Unknown";
  if (header.includes("allele1") && header.includes("allele2")) return "AncestryDNA";
  if (header.includes("23andMe") || header.includes("genotype")) return "23andMe";
  if (header.includes("MyHeritage")) return "MyHeritage";
  return "Unknown";
}

/** Normalize genotype string from various formats */
function normalizeGenotype(parts: string[], format: GeneticSourceFormat): string {
  if (format === "AncestryDNA" && parts.length >= 5) {
    return `${parts[3]}${parts[4]}`.replace(/\s/g, "");
  }
  if (parts.length >= 4) {
    return parts[3].replace(/\s/g, "").toUpperCase();
  }
  return "";
}

/** Classify variant status from genotype */
function classifyGenotype(
  genotype: string,
  riskAlleles: readonly string[]
): GeneticVariantStatus {
  if (!genotype) return "not_found";
  const upper = genotype.toUpperCase();
  const hasRisk = [...riskAlleles].some((a) => upper.includes(a.toUpperCase()));
  // Heterozygous or homozygous risk allele → detected
  if (hasRisk && upper.length >= 1) {
    const riskCount = [...upper].filter((c) =>
      riskAlleles.some((r) => r.toUpperCase() === c)
    ).length;
    if (riskCount >= 1) return "detected";
    return "not_detected";
  }
  return "not_detected";
}

/** Parse raw genotype text content */
export function parseGenotypeText(content: string): ParseGeneticsResult {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const sourceFormat = detectSourceFormat(lines);
  const genotypeMap = new Map<string, string>();

  for (const line of lines) {
    if (line.startsWith("#")) continue;
    const trimmed = line.trim();
    if (!trimmed || trimmed.toLowerCase().startsWith("rsid")) continue;

    const parts = trimmed.split(/\t|,|\s+/).filter(Boolean);
    if (parts.length < 4) continue;

    const rsid = parts[0].toLowerCase();
    if (!rsid.startsWith("rs")) continue;

    const genotype = normalizeGenotype(parts, sourceFormat);
    genotypeMap.set(rsid, genotype);
  }

  const variants: GeneticVariantResult[] = TARGET_VARIANTS.map((target) => {
    const key = target.rsid.toLowerCase();
    const raw = genotypeMap.get(key);

    if (raw === undefined) {
      return {
        rsid: target.rsid,
        gene: target.gene,
        status: "not_found" as GeneticVariantStatus,
        interpretation: `${target.gene} variant not found in uploaded file.`,
        riskContribution: 0,
      };
    }

    const status = classifyGenotype(raw, target.riskAlleles);
    const riskContribution =
      status === "detected" ? target.riskWeight : 0;

    return {
      rsid: target.rsid,
      gene: target.gene,
      status,
      genotype: raw,
      interpretation: target.interpretation,
      riskContribution,
    };
  });

  const compoundRisk =
    variants.find((v) => v.rsid === "rs10305420")?.status === "detected" &&
    variants.find((v) => v.rsid === "rs1800437")?.status === "detected";

  return { sourceFormat, variants, compoundRisk };
}

/** Read file buffer and parse (supports zip via JSZip in API route) */
export async function parseGeneticsFile(
  buffer: ArrayBuffer,
  fileName: string
): Promise<ParseGeneticsResult> {
  if (buffer.byteLength > MAX_FILE_BYTES) {
    throw new Error("File too large. Maximum size is 50MB.");
  }

  const lower = fileName.toLowerCase();

  if (lower.endsWith(".zip")) {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(buffer);
    const names = Object.keys(zip.files).filter(
      (n) => !n.endsWith("/") && /\.(txt|csv|tsv)$/i.test(n)
    );
    if (names.length === 0) {
      throw new Error(
        "Unable to read this genetic file. Please upload raw genotype data from 23andMe, AncestryDNA, MyHeritage, or another provider."
      );
    }
    const first = names[0];
    const content = await zip.file(first)!.async("string");
    return parseGenotypeText(content);
  }

  const decoder = new TextDecoder("utf-8");
  const content = decoder.decode(buffer);
  if (!content.includes("rs") && !content.toLowerCase().includes("rsid")) {
    throw new Error(
      "Unable to read this genetic file. No rsid column found. Please upload raw genotype data."
    );
  }
  return parseGenotypeText(content);
}
