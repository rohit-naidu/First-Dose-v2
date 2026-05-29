import type { IntakeDraft, IntakeResponse } from "./types";

const INTAKES_KEY = "glp1-precision-intakes";
const DRAFT_KEY = "glp1-precision-draft";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Load all saved reports keyed by id */
export function getAllIntakes(): Record<string, IntakeResponse> {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(INTAKES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, IntakeResponse>;
  } catch {
    return {};
  }
}

/** Save or update one completed intake report */
export function saveIntake(intake: IntakeResponse): void {
  if (!isBrowser()) return;
  const all = getAllIntakes();
  all[intake.id] = intake;
  localStorage.setItem(INTAKES_KEY, JSON.stringify(all));
}

/** Load a single report by id */
export function getIntakeById(id: string): IntakeResponse | null {
  const all = getAllIntakes();
  return all[id] ?? null;
}

/** Delete a report (optional cleanup) */
export function deleteIntake(id: string): void {
  if (!isBrowser()) return;
  const all = getAllIntakes();
  delete all[id];
  localStorage.setItem(INTAKES_KEY, JSON.stringify(all));
}

/** Persist wizard draft while user is filling the form */
export function saveDraft(draft: IntakeDraft): void {
  if (!isBrowser()) return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

/** Load in-progress wizard draft */
export function loadDraft(): IntakeDraft | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IntakeDraft;
  } catch {
    return null;
  }
}

/** Clear wizard draft after report is generated */
export function clearDraft(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(DRAFT_KEY);
}

/** Update clinician notes on an existing report */
export function updateClinicianNotes(id: string, notes: string): void {
  const intake = getIntakeById(id);
  if (!intake?.report) return;
  intake.report.clinicianNotes = notes;
  saveIntake(intake);
}
