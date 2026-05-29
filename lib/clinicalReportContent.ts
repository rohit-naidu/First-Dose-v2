import type { IntakeResponse, PhenotypeType, ProtocolType } from "./types";
import { PROTOCOL_INFO } from "./dosingProtocols";
import { scoreMedicationIntolerance } from "./scoring";

export type SummaryRow = {
  metric: string;
  value: string;
  implication: string;
};

export type PhenotypeSection = {
  id: PhenotypeType | "context";
  title: string;
  role: "primary" | "secondary" | "contextual";
  physiology: string;
  clinicalRationale: string;
  dosingStrategy: string;
};

export type GenomicLocusDetail = {
  rsid: string;
  gene: string;
  genotype: string;
  impact: "High" | "Moderate" | "Low" | "Not detected";
  mechanism: string;
  interpretation: string;
  dosingImpact: string;
};

export type EquationContributor = { label: string; value: number };

export type ClinicalReportContent = {
  reportTitle: string;
  patientDisplay: string;
  generatedDate: string;
  medicationLine: string;
  velocity: number;
  velocityLabel: string;
  protocol: ProtocolType;
  protocolLabel: string;
  microdoseExample: string;
  summaryRows: SummaryRow[];
  geneticRiskSummary: string;
  compoundGeneticWarning?: string;
  phenotypeSections: PhenotypeSection[];
  genomicLoci: GenomicLocusDetail[];
  equation: {
    E: number;
    T: number;
    S: number;
    V: number;
    eContributors: EquationContributor[];
    tContributors: EquationContributor[];
    sContributors: EquationContributor[];
    clinicalRule: string;
  };
  sideEffectLadder: { step: number; nausea: string; ancillary: string }[];
  musclePreservation: string[];
  mealSatietyNote: string;
  curveType: "microdosing" | "gradual_adaptive" | "standard";
};

const PHENOTYPE_COPY: Record<
  PhenotypeType,
  Omit<PhenotypeSection, "id" | "title" | "role">
> = {
  "Hungry Gut": {
    physiology:
      "Fast baseline gastric emptying and deficient native postprandial GLP-1 secretion.",
    clinicalRationale:
      'Prime incretin candidates — phenotype-matched therapy may achieve nearly double the weight loss versus non-matched approaches in similar populations (literature-supported directional estimate).',
    dosingStrategy:
      "Utilize extended titration intervals (6–8 weeks) to avoid overwhelming the sensitive ileal brake.",
  },
  "Hungry Brain": {
    physiology:
      "Satiation deficit — patient may require higher caloric loads before perceiving fullness.",
    clinicalRationale:
      "Often needs higher effective maintenance exposure; clinician may discuss structured high-protein meals and adjunct appetite strategies.",
    dosingStrategy:
      "Monitor fullness threshold from meal estimate; avoid under-dosing if hunger returns before next dose interval.",
  },
  "Emotional Eating": {
    physiology:
      "Hedonic reward-seeking and food-noise driven intake independent of homeostatic hunger.",
    clinicalRationale:
      "GLP-1 class effects on mesolimbic reward pathways may reduce 'food noise' — monitor mood and emotional flatness at higher doses.",
    dosingStrategy:
      "Favor symptom-guided, lower effective doses with behavioral support (CBT, stress replacement behaviors).",
  },
  "Slow Burn": {
    physiology:
      "Reduced resting energy expenditure and elevated lean-mass loss risk during caloric deficit.",
    clinicalRationale:
      "Highly prone to muscle wasting during rapid weight loss — up to a substantial fraction of total loss may be lean mass without intervention.",
    dosingStrategy:
      "Never escalate if functional strength declines (e.g., sit-to-stand, grip, stair fatigue).",
  },
};

function effectiveCalories(intake: IntakeResponse): number | null {
  const h = intake.hunger;
  return (
    h.userEditedCalories ?? h.aiEstimatedCalories ?? h.mealEstimate?.totalCalories ?? null
  );
}

function microdoseExample(med: string): string {
  if (med.includes("Tirzepatide"))
    return "Start ~10–25% of standard (e.g., 0.625–1.25 mg weekly vs 2.5 mg) under clinician supervision.";
  if (med.includes("Semaglutide"))
    return "Start ~10–25% of standard (e.g., 0.05–0.125 mg weekly vs 0.25 mg) under clinician supervision.";
  if (med.includes("Liraglutide"))
    return "Start ~10–25% of standard daily dose per clinician protocol.";
  return "Start at 10–25% of standard starting dose for selected GLP-1 agent.";
}

function buildGenomicLoci(intake: IntakeResponse): GenomicLocusDetail[] {
  const glp1 = intake.genetics.variants.find((v) => v.rsid === "rs10305420");
  const gipr = intake.genetics.variants.find((v) => v.rsid === "rs1800437");

  const loci: GenomicLocusDetail[] = [];

  if (glp1) {
    const detected = glp1.status === "detected";
    loci.push({
      rsid: "rs10305420",
      gene: "GLP1R",
      genotype: glp1.genotype ?? (detected ? "A/G" : "—"),
      impact: detected ? "High" : glp1.status === "not_found" ? "Low" : "Moderate",
      mechanism:
        "May alter GLP-1 receptor density and post-receptor signaling — influences both efficacy and emetic sensitivity.",
      interpretation: detected
        ? "Hyper-responder / hyper-sensitive phenotype pattern. May be associated with greater weight response and higher nausea/vomiting risk — interpret in full clinical context."
        : "No risk allele pattern detected at this locus in uploaded file.",
      dosingImpact: detected
        ? 'Requires "Hold & Reduce" protocol — if vomiting occurs, return to prior tolerated dose and hold 6–8 weeks before re-escalation.'
        : "Standard symptom-guided titration may be appropriate if other brakes are low.",
    });
  }

  if (gipr) {
    const detected = gipr.status === "detected";
    const tirz = intake.patient.currentMedicationStatus.includes("Tirzepatide");
    loci.push({
      rsid: "rs1800437",
      gene: "GIPR",
      genotype: gipr.genotype ?? (detected ? "C/T" : "—"),
      impact: detected ? "Moderate" : gipr.status === "not_found" ? "Low" : "Moderate",
      mechanism:
        "GIP receptor stability under dual GIP/GLP-1 agonism — relevant primarily for tirzepatide pathways.",
      interpretation: detected
        ? `May be associated with increased vomiting risk on tirzepatide-class therapy (literature-supported directional estimate).${tirz ? " Patient is on tirzepatide — prioritize conservative escalation." : ""}`
        : "No risk allele pattern detected at this locus in uploaded file.",
      dosingImpact: detected
        ? "Avoid rapid escalation; prioritize sub-therapeutic starting doses and extended intervals."
        : "Less GIP-specific brake if not on dual agonist.",
    });
  }

  if (loci.length === 0) {
    loci.push({
      rsid: "—",
      gene: "GLP1R / GIPR",
      genotype: "—",
      impact: "Low",
      mechanism: "No raw genetic file uploaded.",
      interpretation:
        "Genetic tolerability screen not performed — side-effect risk not eliminated.",
      dosingImpact: "Rely on phenotype and intolerance history for titration velocity.",
    });
  }

  return loci;
}

function geneticRiskSummary(intake: IntakeResponse): string {
  const glp1 = intake.genetics.variants.find((v) => v.rsid === "rs10305420");
  const gipr = intake.genetics.variants.find((v) => v.rsid === "rs1800437");
  if (glp1?.status === "detected" && gipr?.status === "detected")
    return "Compound GLP1R + GIPR sensitivity — elevated emetic risk on dual-agonist therapy.";
  if (glp1?.status === "detected") return "GLP1R high-sensitivity signal detected.";
  if (gipr?.status === "detected") return "GIPR tolerability signal (tirzepatide-relevant).";
  if (intake.genetics.uploaded) return "Screened — no high-impact risk alleles detected.";
  return "Not screened (optional upload).";
}

function buildPhenotypeSections(intake: IntakeResponse): PhenotypeSection[] {
  const s = intake.scores!;
  const sections: PhenotypeSection[] = [];

  const primary = s.primaryPhenotype;
  sections.push({
    id: primary,
    title: primary,
    role: "primary",
    ...PHENOTYPE_COPY[primary],
  });

  if (s.secondaryPhenotype && s.secondaryPhenotype !== primary) {
    sections.push({
      id: s.secondaryPhenotype,
      title: s.secondaryPhenotype,
      role: "secondary",
      ...PHENOTYPE_COPY[s.secondaryPhenotype],
    });
  }

  const contextual: PhenotypeType[] = ["Hungry Brain", "Emotional Eating"];
  for (const p of contextual) {
    if (p === primary || p === s.secondaryPhenotype) continue;
    const score =
      p === "Hungry Brain" ? s.hungryBrainScore : s.emotionalEatingScore;
    if (score >= 1) {
      sections.push({
        id: p,
        title: p,
        role: "contextual",
        ...PHENOTYPE_COPY[p],
      });
    }
  }

  return sections;
}

function buildEquationBreakdown(intake: IntakeResponse) {
  const s = intake.scores!;
  const eContributors: EquationContributor[] = [
    {
      label: `${s.primaryPhenotype} (primary efficacy driver)`,
      value: s.efficacyScore,
    },
  ];

  const tContributors: EquationContributor[] = [];
  const glp1 = intake.genetics.variants.find((v) => v.rsid === "rs10305420");
  const gipr = intake.genetics.variants.find((v) => v.rsid === "rs1800437");
  if (glp1?.status === "detected")
    tContributors.push({ label: "rs10305420 (GLP1R)", value: 1 });
  if (gipr?.status === "detected")
    tContributors.push({ label: "rs1800437 (GIPR)", value: 1 });
  if (intake.genetics.compoundRisk)
    tContributors.push({ label: "Compound carrier modifier", value: 1.5 });
  const medInt = scoreMedicationIntolerance(
    intake.autonomic.medicationIntoleranceHistory
  );
  if (medInt > 0)
    tContributors.push({
      label: `Medication intolerance (${intake.autonomic.medicationIntoleranceHistory})`,
      value: medInt,
    });

  const sContributors: EquationContributor[] = [];
  if (s.sarcopeniaRisk > 0)
    sContributors.push({
      label: `Sarcopenia / muscle risk (score ${s.slowBurnScore}, age ${intake.age ?? "—"})`,
      value: s.sarcopeniaRisk,
    });
  if (s.autonomicRisk > 0)
    sContributors.push({
      label: `Autonomic / POTS-style (${intake.autonomic.orthostaticSymptoms})`,
      value: s.autonomicRisk,
    });

  const clinicalRule =
    s.titrationVelocity < 0.8
      ? "V < 0.8 → Microdosing or symptom-guided titration mandated."
      : s.titrationVelocity <= 1.5
        ? "0.8 ≤ V ≤ 1.5 → Gradual adaptive intervals (6–8 weeks)."
        : "V > 1.5 → May tolerate standard 4-week steps if symptoms absent.";

  return {
    E: s.efficacyScore,
    T: s.tolerabilityBrake,
    S: s.structuralRisk,
    V: s.titrationVelocity,
    eContributors,
    tContributors,
    sContributors,
    clinicalRule,
  };
}

export const SIDE_EFFECT_LADDER = [
  { step: 1, nausea: "Three small meals; dinner ≥3 hours before bed.", ancillary: "Magnesium glycinate (bedtime)." },
  { step: 2, nausea: "Ginger (whole root) or peppermint tea with meals.", ancillary: "Ginger root extract." },
  { step: 3, nausea: "OTC antacids (calcium-free) per clinician guidance.", ancillary: "Psyllium husk (fiber)." },
  { step: 4, nausea: "Physician-prescribed anti-emetics (e.g., ondansetron).", ancillary: "B12 / L-tyrosine (mood support)." },
  { step: 5, nausea: "Pause and reassess — Hold & Reduce protocol.", ancillary: "Clinician-directed probiotic support." },
];

export const MUSCLE_PRESERVATION_ITEMS = [
  "Protein floor: 1.2–1.6 g/kg/day high-quality protein to protect lean mass.",
  "Resistance protocol: 2–3 weekly sessions — posterior chain and core priority.",
  "MSK monitoring: neck or lower back pain during weight loss may signal muscle wasting — reduce titration velocity.",
  'Slow Burn ancillary: clinician may discuss HMB or creatine for at-risk patients.',
  "Biliary safety: if RUQ pain history exists, clinician may consider CCK-HIDA before rapid loss.",
];

export function buildClinicalReportContent(
  intake: IntakeResponse
): ClinicalReportContent {
  const s = intake.scores!;
  const protocolInfo = PROTOCOL_INFO[s.protocol];
  const calories = effectiveCalories(intake);
  const med = intake.patient.currentMedicationStatus;

  const summaryRows: SummaryRow[] = [
    {
      metric: "Primary Phenotype",
      value: s.primaryPhenotype,
      implication: "High incretin responder profile when gut-driven hunger dominates.",
    },
    {
      metric: "Secondary Signal",
      value: s.secondaryPhenotype ?? "None prominent",
      implication:
        s.secondaryPhenotype === "Slow Burn"
          ? "Elevated sarcopenia and metabolic stalling risk."
          : "Monitor as adjunct titration modifier.",
    },
    {
      metric: "Genetic Risk",
      value: geneticRiskSummary(intake),
      implication:
        intake.genetics.compoundRisk
          ? "Compound tolerability — conservative escalation required."
          : "Informs emetic risk and Hold & Reduce threshold.",
    },
    {
      metric: "Recommended Protocol",
      value: protocolInfo.label,
      implication: protocolInfo.titrationGuidance,
    },
  ];

  return {
    reportTitle: "Precision GLP-1 Titration & Phenotype Protocol Report",
    patientDisplay: intake.patient.name,
    generatedDate: new Date(intake.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    medicationLine: `${med}${intake.patient.currentDose ? ` · ${intake.patient.currentDose}` : ""}`,
    velocity: s.titrationVelocity,
    velocityLabel: protocolInfo.label,
    protocol: s.protocol,
    protocolLabel: protocolInfo.label,
    microdoseExample: microdoseExample(med),
    summaryRows,
    geneticRiskSummary: geneticRiskSummary(intake),
    compoundGeneticWarning: intake.genetics.compoundRisk
      ? "Both GLP1R and GIPR tolerability markers detected — compound emetic risk; closest monitoring for vomiting and dehydration."
      : undefined,
    phenotypeSections: buildPhenotypeSections(intake),
    genomicLoci: buildGenomicLoci(intake),
    equation: buildEquationBreakdown(intake),
    sideEffectLadder: SIDE_EFFECT_LADDER,
    musclePreservation: MUSCLE_PRESERVATION_ITEMS,
    mealSatietyNote: calories
      ? `Fullness threshold ~${calories} kcal (AI-estimated from meal narrative). Hungry Brain score: ${s.hungryBrainScore}/3.`
      : "Meal satiety estimate not available.",
    curveType: s.protocol,
  };
}
