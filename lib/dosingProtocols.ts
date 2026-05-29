import type { PhenotypeType, ProtocolType } from "./types";

export type ProtocolInfo = {
  label: string;
  badgeColor: "green" | "yellow" | "orange" | "red";
  description: string;
  titrationGuidance: string;
};

/** Protocol display copy — clinician-support language only */
export const PROTOCOL_INFO: Record<ProtocolType, ProtocolInfo> = {
  standard: {
    label: "Standard Titration Candidate",
    badgeColor: "green",
    description:
      "Patient may be appropriate for standard 4-week titration intervals if side effects remain minimal and clinician agrees.",
    titrationGuidance:
      "Consider standard interval escalation only when GI symptoms are fully resolved and vitals are stable.",
  },
  gradual_adaptive: {
    label: "Gradual Adaptive Titration",
    badgeColor: "yellow",
    description:
      "Patient may benefit from 6–8 week dose intervals, symptom-guided escalation, and holding dose until GI side effects fully resolve.",
    titrationGuidance:
      "Extend intervals between dose increases; escalate only when prior dose is well tolerated for several weeks.",
  },
  microdosing: {
    label: "Microdosing / Conservative Start",
    badgeColor: "orange",
    description:
      "Patient may warrant starting at 10–25% of standard starting dose, with monthly titration only if side effects remain absent or minimal.",
    titrationGuidance:
      "Consider sub-starting doses and monthly micro-steps under close clinician supervision.",
  },
};

export const HOLD_REDUCE_PROTOCOL = {
  title: "Hold & Reduce Protocol",
  text: "If a flare occurs, consider returning to the previous tolerated dose and holding for an extended interval before any further escalation, under clinician supervision.",
  triggers: [
    "Unresolved vomiting",
    "Severe abdominal pain",
    "Dehydration",
    "Fainting",
    "Persistent tachycardia",
  ],
};

export const HARD_SAFETY_RULE =
  "Never escalate dose while unresolved side effects are present.";

/** Ancillary recommendations by phenotype and risk flags */
export function getAncillaryRecommendations(input: {
  primaryPhenotype: PhenotypeType;
  secondaryPhenotype?: PhenotypeType;
  autonomicRisk: number;
  sarcopeniaRisk: number;
  geneticRisk: number;
  emotionalEatingScore: number;
  compoundGenetic?: boolean;
}): string[] {
  const recs: string[] = [];

  if (input.primaryPhenotype === "Hungry Gut" || input.secondaryPhenotype === "Hungry Gut") {
    recs.push(
      "Clinician may consider slower titration with attention to hydration and constipation prevention.",
      "Supportive options discussed with clinician may include psyllium fiber, magnesium glycinate, or ginger for nausea support."
    );
  }

  if (input.primaryPhenotype === "Hungry Brain" || input.secondaryPhenotype === "Hungry Brain") {
    recs.push(
      "Higher satiety support through structured, high-protein meals may be beneficial.",
      "Clinician may consider adjunct appetite-control strategies if appropriate."
    );
  }

  if (
    input.primaryPhenotype === "Emotional Eating" ||
    input.emotionalEatingScore >= 2
  ) {
    recs.push(
      "Monitor for emotional flatness or reduced pleasure at higher effective doses.",
      "Behavioral support (CBT, stress-eating replacement behaviors) may complement medication titration.",
      "Patients with reward-system vulnerability may respond well to low doses but should be monitored for mood changes."
    );
  }

  if (input.primaryPhenotype === "Slow Burn" || input.sarcopeniaRisk >= 2) {
    recs.push(
      "Protein target for clinician discussion: approximately 1.2–1.6 g/kg/day.",
      "Resistance training and lean-mass monitoring recommended.",
      "Clinician may discuss creatine or HMB support; avoid dose escalation if strength declines."
    );
  }

  if (input.autonomicRisk >= 2) {
    recs.push(
      "Fluid and electrolyte support; slower dose increases.",
      "Monitor resting heart rate; clinician review if palpitations or fainting occur.",
      "Clinician should evaluate POTS-like symptoms before escalation."
    );
  }

  if (input.geneticRisk >= 1 || input.compoundGenetic) {
    recs.push(
      "Conservative titration with smaller dose steps suggested.",
      "Hold dose if nausea or vomiting occurs; clinician review before escalation."
    );
  }

  if (input.compoundGenetic) {
    recs.push(
      "Compound tolerability risk: both GLP1R and GIPR markers detected — closer monitoring for vomiting, dehydration, and discontinuation risk."
    );
  }

  return recs;
}
