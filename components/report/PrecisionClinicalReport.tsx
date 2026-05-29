"use client";

import { useState } from "react";
import type { IntakeResponse } from "@/lib/types";
import { buildClinicalReportContent } from "@/lib/clinicalReportContent";
import { CLINICIAN_SUPPORT_FRAMING, FOOTER_DISCLAIMER, GENETIC_DISCLAIMER } from "@/lib/disclaimers";
import { HOLD_REDUCE_PROTOCOL, HARD_SAFETY_RULE } from "@/lib/dosingProtocols";
import { updateClinicianNotes } from "@/lib/storage";
import { PDFExportButton } from "@/components/PDFExportButton";
import { DoseCurveChart } from "./DoseCurveChart";
import { ReportSection } from "./ReportSection";
import { RetroPrintChrome } from "./RetroPrintChrome";

type PrecisionClinicalReportProps = {
  intake: IntakeResponse;
  showActions?: boolean;
};

function VelocityReadout({ v, label }: { v: number; label: string }) {
  return (
    <div className="retro-velocity">
      <p className="velocity-label">Targeted titration velocity (V)</p>
      <p className="velocity-value">{v.toFixed(2)}</p>
      <p className="velocity-protocol">{label}</p>
    </div>
  );
}

export function PrecisionClinicalReport({
  intake,
  showActions = true,
}: PrecisionClinicalReportProps) {
  const [notes, setNotes] = useState(intake.report?.clinicianNotes ?? "");

  const clinical =
    intake.report?.clinical ?? buildClinicalReportContent(intake);
  const s = intake.scores;
  const r = intake.report;

  if (!s || !r) {
    return <p>Report data unavailable.</p>;
  }

  const saveNotes = () => updateClinicianNotes(intake.id, notes);

  return (
    <article id="clinician-report" className="retro-clinical-document">
      <RetroPrintChrome
        intake={intake}
        protocolLabel={clinical.protocolLabel}
        velocity={clinical.velocity}
      />

      <header className="report-masthead">
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <p className="masthead-label">Clinician-support · Not a prescription</p>
            <h1>{clinical.reportTitle}</h1>
            <p className="masthead-desc">
              Adaptive GLP-1 / dual-agonist titration from phenotype, genomic, and
              tolerability inputs. Not BMI-only dosing.
            </p>
          </div>
          {showActions && (
            <div className="no-print">
              <PDFExportButton />
            </div>
          )}
        </div>
        <dl>
          <div>
            <dt>Patient</dt>
            <dd>{clinical.patientDisplay}</dd>
          </div>
          <div>
            <dt>Generated</dt>
            <dd>{clinical.generatedDate}</dd>
          </div>
          <div>
            <dt>Therapy</dt>
            <dd>{clinical.medicationLine}</dd>
          </div>
          <div>
            <dt>Context</dt>
            <dd>
              Age {intake.age} · BMI {intake.bmi} (reference)
            </dd>
          </div>
        </dl>
      </header>

      <div className="report-body">
        <ReportSection
          roman="I"
          title="Clinical Summary & Actionable Protocol"
          subtitle="Executive decision table and titration velocity"
        >
          <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <VelocityReadout v={clinical.velocity} label={clinical.velocityLabel} />
            <div className="retro-dose-box">
              <h4>Starting dose guidance</h4>
              <p>{clinical.microdoseExample}</p>
              {clinical.compoundGeneticWarning && (
                <p className="retro-warning">{clinical.compoundGeneticWarning}</p>
              )}
            </div>
          </div>

          <div className="retro-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value / finding</th>
                  <th>Clinical implication</th>
                </tr>
              </thead>
              <tbody>
                {clinical.summaryRows.map((row) => (
                  <tr key={row.metric}>
                    <td><strong>{row.metric}</strong></td>
                    <td>{row.value}</td>
                    <td>{row.implication}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DoseCurveChart protocol={clinical.curveType} />
          <ul className="retro-chart-legend">
            <li>Standard curve: 4-week steps toward max dose (~month 5).</li>
            <li>Precision curve: hold 6–8 weeks if GI symptoms persist.</li>
          </ul>
        </ReportSection>

        <ReportSection
          roman="II"
          title="Precision Phenotype Breakdown"
          subtitle="Phenotype-matched incretin therapy"
        >
          <p className="retro-meal-note">{clinical.mealSatietyNote}</p>
          {clinical.phenotypeSections.map((p) => (
            <div
              key={`${p.id}-${p.role}`}
              className={`retro-phenotype ${p.role === "primary" ? "retro-phenotype--primary" : ""}`}
            >
              <h3>
                {p.title}
                <span className="role-tag">{p.role}</span>
              </h3>
              <dl>
                <dt>Physiology</dt>
                <dd>{p.physiology}</dd>
                <dt>Clinical rationale</dt>
                <dd>{p.clinicalRationale}</dd>
                <dt>Dosing strategy</dt>
                <dd><strong>{p.dosingStrategy}</strong></dd>
              </dl>
            </div>
          ))}
        </ReportSection>

        <ReportSection
          roman="III"
          title="Targeted Genomic Breakdown"
          subtitle="Locus-level tolerability screen"
        >
          {clinical.genomicLoci.map((locus) => (
            <div key={locus.rsid} className="retro-locus">
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                <h3>
                  {locus.gene} ({locus.rsid})
                </h3>
                <span className="impact-tag">{locus.impact} impact</span>
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                Genotype: <strong>{locus.genotype}</strong>
              </p>
              <div className="locus-field">
                <dt>Mechanism</dt>
                <dd>{locus.mechanism}</dd>
              </div>
              <div className="locus-field">
                <dt>Interpretation</dt>
                <dd>{locus.interpretation}</dd>
              </div>
              <div className="locus-field">
                <dt>Dosing impact</dt>
                <dd><strong>{locus.dosingImpact}</strong></dd>
              </div>
            </div>
          ))}
          <p style={{ fontSize: "0.7rem", marginTop: "0.5rem" }}>{GENETIC_DISCLAIMER}</p>
        </ReportSection>

        <ReportSection
          roman="IV"
          title="Clinical Side Effect Ladder & Ancillaries"
          subtitle="Structured escalation"
        >
          <div className="retro-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Nausea management</th>
                  <th>Ancillary (clinician discussion)</th>
                </tr>
              </thead>
              <tbody>
                {clinical.sideEffectLadder.map((row) => (
                  <tr key={row.step}>
                    <td><strong>{row.step}</strong></td>
                    <td>{row.nausea}</td>
                    <td>{row.ancillary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="retro-safety">
            <h4>{HARD_SAFETY_RULE}</h4>
            <p style={{ fontSize: "0.8rem", margin: "0.35rem 0" }}>{HOLD_REDUCE_PROTOCOL.text}</p>
          </div>
          {r.recommendations.length > 0 && (
            <ul className="retro-list-plain">
              {r.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          )}
        </ReportSection>

        <ReportSection roman="V" title="Muscle Preservation & MSK Safety">
          <p style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>
            Monitor functional strength alongside scale weight.
          </p>
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {clinical.musclePreservation.map((item, i) => (
              <li key={i} className="retro-msk-item">
                <span className="num">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginTop: "0.5rem" }}>
            <div className="retro-stat-tile">
              <strong>{intake.muscle.resistanceTrainingDays}</strong>
              RT days / week
            </div>
            <div className="retro-stat-tile">
              <strong>{intake.muscle.chairStandAbility}</strong>
              Chair stand
            </div>
            <div className="retro-stat-tile">
              <strong>{intake.muscle.muscleLossSymptoms}</strong>
              Muscle symptoms
            </div>
          </div>
        </ReportSection>

        <ReportSection
          roman="VI"
          title="The Precision Dosing Equation"
          subtitle="V = E / (T + S)"
        >
          <div className="retro-equation-hero">
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Formula</p>
            <p className="formula">V = E / (T + S)</p>
            <p style={{ fontSize: "0.75rem" }}>Efficacy ÷ (Tolerability brake + Structural risk)</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.5rem", marginTop: "0.75rem" }}>
            <div className="retro-eq-card">
              <p className="eq-label">E — Efficacy</p>
              <p className="eq-value">{clinical.equation.E}</p>
              <ul>
                {clinical.equation.eContributors.map((c) => (
                  <li key={c.label}>{c.label}: +{c.value}</li>
                ))}
              </ul>
            </div>
            <div className="retro-eq-card">
              <p className="eq-label">T — Tolerability</p>
              <p className="eq-value">{clinical.equation.T}</p>
              <ul>
                {clinical.equation.tContributors.length ? (
                  clinical.equation.tContributors.map((c) => (
                    <li key={c.label}>{c.label}: +{c.value}</li>
                  ))
                ) : (
                  <li>None</li>
                )}
              </ul>
            </div>
            <div className="retro-eq-card">
              <p className="eq-label">S — Structural</p>
              <p className="eq-value">{clinical.equation.S}</p>
              <ul>
                {clinical.equation.sContributors.length ? (
                  clinical.equation.sContributors.map((c) => (
                    <li key={c.label}>{c.label}: +{c.value}</li>
                  ))
                ) : (
                  <li>Low</li>
                )}
              </ul>
            </div>
          </div>

          <div className="retro-eq-resolve">
            V = {clinical.equation.E} / ({clinical.equation.T} + {clinical.equation.S}) ={" "}
            <span className="v-result">{clinical.equation.V.toFixed(2)}</span>
          </div>
          <p style={{ textAlign: "center", fontSize: "0.8rem", marginTop: "0.5rem", fontWeight: 600 }}>
            {clinical.equation.clinicalRule}
          </p>
        </ReportSection>

        <div className="retro-safety">
          <h3>Active safety flags</h3>
          <ul className="retro-list-plain">
            {r.safetyFlags.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>

        <section className="retro-notes-section no-print">
          <h3>Clinician notes</h3>
          <textarea
            placeholder="Visit notes, labs, titration plan…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
          />
        </section>

        {notes.trim() && (
          <div className="retro-print-notes-block" style={{ display: "none" }}>
            <pre className="retro-print-notes">{notes}</pre>
          </div>
        )}

        <footer className="retro-doc-footer">
          <p>{CLINICIAN_SUPPORT_FRAMING}</p>
          <p style={{ marginTop: "0.35rem" }}>{FOOTER_DISCLAIMER}</p>
        </footer>
      </div>
    </article>
  );
}
