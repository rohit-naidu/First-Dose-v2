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

type PrecisionClinicalReportProps = {
  intake: IntakeResponse;
  showActions?: boolean;
};

function VelocityBadge({ v, label }: { v: number; label: string }) {
  const color =
    v < 0.8
      ? "from-orange-500 to-red-600"
      : v <= 1.5
        ? "from-amber-400 to-orange-500"
        : "from-emerald-500 to-teal-600";

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${color} p-6 text-white shadow-xl`}>
      <p className="text-sm font-medium uppercase tracking-wide opacity-90">
        Targeted Titration Velocity (V)
      </p>
      <p className="mt-2 text-5xl font-bold tabular-nums">{v.toFixed(2)}</p>
      <p className="mt-3 text-lg font-semibold">{label}</p>
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
    return <p className="text-slate-600">Report data unavailable.</p>;
  }

  const saveNotes = () => updateClinicianNotes(intake.id, notes);

  return (
    <article
      id="clinician-report"
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50"
    >
      {/* Document header */}
      <header className="bg-gradient-to-br from-[#0f2744] via-[#1e3a5f] to-[#2d4a6f] px-6 py-10 text-white sm:px-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              Clinician-support · Not a prescription
            </p>
            <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
              {clinical.reportTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-blue-100/90">
              Multi-dimensional framework for optimizing GLP-1 / dual-agonist therapy —
              adaptive titration driven by molecular, physiological, and behavioral
              biomarkers. Moves beyond BMI-only dosing.
            </p>
          </div>
          {showActions && (
            <div className="no-print">
              <PDFExportButton />
            </div>
          )}
        </div>
        <dl className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-blue-200">Patient</dt>
            <dd className="font-semibold">{clinical.patientDisplay}</dd>
          </div>
          <div>
            <dt className="text-xs text-blue-200">Generated</dt>
            <dd className="font-semibold">{clinical.generatedDate}</dd>
          </div>
          <div>
            <dt className="text-xs text-blue-200">Therapy</dt>
            <dd className="font-semibold">{clinical.medicationLine}</dd>
          </div>
          <div>
            <dt className="text-xs text-blue-200">Context</dt>
            <dd className="font-semibold">
              Age {intake.age} · BMI {intake.bmi} (reference only)
            </dd>
          </div>
        </dl>
      </header>

      <div className="space-y-8 bg-slate-50/50 p-6 sm:p-10">
        {/* Section I */}
        <ReportSection
          roman="I"
          title="Clinical Summary & Actionable Protocol"
          subtitle="Executive decision table and titration velocity"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <VelocityBadge v={clinical.velocity} label={clinical.velocityLabel} />
            <div className="flex flex-col justify-center rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
              <p className="text-sm font-semibold text-[#1e3a5f]">Starting dose guidance</p>
              <p className="mt-2 text-slate-700">{clinical.microdoseExample}</p>
              {clinical.compoundGeneticWarning && (
                <p className="mt-4 rounded-lg bg-orange-100 px-3 py-2 text-sm text-orange-900">
                  ⚠ {clinical.compoundGeneticWarning}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-4 py-3 font-semibold text-slate-700">Metric</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Value / Finding</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Clinical Implication
                  </th>
                </tr>
              </thead>
              <tbody>
                {clinical.summaryRows.map((row) => (
                  <tr key={row.metric} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-[#1e3a5f]">{row.metric}</td>
                    <td className="px-4 py-3 text-slate-800">{row.value}</td>
                    <td className="px-4 py-3 text-slate-600">{row.implication}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8">
            <DoseCurveChart protocol={clinical.curveType} />
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>
                <strong className="text-slate-800">Standard curve:</strong> Steep 4-week
                steps toward max dose by ~month 5.
              </li>
              <li>
                <strong className="text-slate-800">Precision curve:</strong> Shallow,
                elongated steps — hold dose 6–8 weeks if any GI symptoms persist.
              </li>
            </ul>
          </div>
        </ReportSection>

        {/* Section II */}
        <ReportSection
          roman="II"
          title="Precision Phenotype Breakdown"
          subtitle="Obesity is heterogeneous — phenotype-matched incretin therapy is directionally twice as effective as one-size-fits-all approaches (literature-supported)."
        >
          <p className="mb-6 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-900">
            {clinical.mealSatietyNote}
          </p>
          <div className="space-y-6">
            {clinical.phenotypeSections.map((p) => (
              <div
                key={`${p.id}-${p.role}`}
                className={`rounded-2xl border-l-4 p-5 ${
                  p.role === "primary"
                    ? "border-blue-500 bg-blue-50/60"
                    : p.role === "secondary"
                      ? "border-amber-500 bg-amber-50/40"
                      : "border-slate-300 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-[#1e3a5f]">{p.title}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                      p.role === "primary"
                        ? "bg-blue-600 text-white"
                        : p.role === "secondary"
                          ? "bg-amber-500 text-white"
                          : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {p.role}
                  </span>
                </div>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="font-semibold text-slate-500">Physiology</dt>
                    <dd className="mt-1 text-slate-800">{p.physiology}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Clinical rationale</dt>
                    <dd className="mt-1 text-slate-800">{p.clinicalRationale}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Dosing strategy</dt>
                    <dd className="mt-1 font-medium text-blue-900">{p.dosingStrategy}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </ReportSection>

        {/* Section III */}
        <ReportSection
          roman="III"
          title="Targeted Genomic Breakdown"
          subtitle="High-resolution locus profiling for tolerability and pathway-specific risk"
        >
          <div className="space-y-5">
            {clinical.genomicLoci.map((locus) => (
              <div
                key={locus.rsid}
                className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-indigo-950">
                    {locus.gene}{" "}
                    <span className="font-mono text-base text-indigo-600">
                      ({locus.rsid})
                    </span>
                  </h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      locus.impact === "High"
                        ? "bg-red-100 text-red-800"
                        : locus.impact === "Moderate"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {locus.impact} impact
                  </span>
                </div>
                <p className="mt-3 font-mono text-sm text-slate-600">
                  Genotype: <strong className="text-slate-900">{locus.genotype}</strong>
                </p>
                <dl className="mt-4 grid gap-3 sm:grid-cols-1">
                  <div className="rounded-lg bg-white/80 p-3">
                    <dt className="text-xs font-bold uppercase text-slate-500">
                      Biophysical mechanism
                    </dt>
                    <dd className="mt-1 text-sm text-slate-800">{locus.mechanism}</dd>
                  </div>
                  <div className="rounded-lg bg-white/80 p-3">
                    <dt className="text-xs font-bold uppercase text-slate-500">
                      Clinical interpretation
                    </dt>
                    <dd className="mt-1 text-sm text-slate-800">{locus.interpretation}</dd>
                  </div>
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3">
                    <dt className="text-xs font-bold uppercase text-indigo-700">
                      Dosing impact
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-indigo-950">
                      {locus.dosingImpact}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500">{GENETIC_DISCLAIMER}</p>
        </ReportSection>

        {/* Section IV */}
        <ReportSection
          roman="IV"
          title="Clinical Side Effect Ladder & Ancillaries"
          subtitle="Structured escalation — never normalize red-flag symptoms"
        >
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="bg-teal-50">
                  <th className="px-4 py-3 text-left font-semibold text-teal-900">
                    Step
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-teal-900">
                    Nausea management
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-teal-900">
                    Ancillary (clinician discussion)
                  </th>
                </tr>
              </thead>
              <tbody>
                {clinical.sideEffectLadder.map((row) => (
                  <tr key={row.step} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-bold text-teal-700">{row.step}</td>
                    <td className="px-4 py-3 text-slate-700">{row.nausea}</td>
                    <td className="px-4 py-3 text-slate-700">{row.ancillary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="font-semibold text-orange-900">{HARD_SAFETY_RULE}</p>
            <p className="mt-2 text-sm text-orange-800">{HOLD_REDUCE_PROTOCOL.text}</p>
          </div>
          {r.recommendations.length > 0 && (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {r.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          )}
        </ReportSection>

        {/* Section V */}
        <ReportSection roman="V" title="Muscle Preservation & MSK Safety">
          <p className="mb-4 text-sm text-slate-600">
            Rapid weight loss can increase mechanical spine load if paraspinal muscles
            weaken — monitor functional strength alongside scale weight.
          </p>
          <ol className="space-y-4">
            {clinical.musclePreservation.map((item, i) => (
              <li
                key={i}
                className="flex gap-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-slate-800">{item}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-4 text-center border border-slate-200">
              <p className="text-2xl font-bold text-emerald-700">
                {intake.muscle.resistanceTrainingDays}
              </p>
              <p className="text-xs text-slate-500">RT days / week</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-center border border-slate-200">
              <p className="text-sm font-bold text-slate-800">
                {intake.muscle.chairStandAbility}
              </p>
              <p className="text-xs text-slate-500">Chair stand</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-center border border-slate-200">
              <p className="text-sm font-bold text-slate-800">
                {intake.muscle.muscleLossSymptoms}
              </p>
              <p className="text-xs text-slate-500">Muscle symptoms</p>
            </div>
          </div>
        </ReportSection>

        {/* Section VI */}
        <ReportSection
          roman="VI"
          title="The Precision Dosing Equation"
          subtitle="Optimal titration velocity determines safe escalation speed"
        >
          <div className="rounded-2xl bg-[#0f2744] p-8 text-center text-white">
            <p className="text-sm uppercase tracking-widest text-blue-200">Formula</p>
            <p className="mt-4 font-serif text-3xl sm:text-4xl">
              V = E / (T + S)
            </p>
            <p className="mt-2 text-blue-100 text-sm">
              Expected Efficacy ÷ (Tolerability Brake + Structural Risk)
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase text-emerald-800">
                E — Efficacy
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-900">
                {clinical.equation.E}
              </p>
              <ul className="mt-3 space-y-1 text-xs text-emerald-900/80">
                {clinical.equation.eContributors.map((c) => (
                  <li key={c.label}>
                    {c.label}: +{c.value}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase text-amber-800">
                T — Tolerability brake
              </p>
              <p className="mt-2 text-3xl font-bold text-amber-900">
                {clinical.equation.T}
              </p>
              <ul className="mt-3 space-y-1 text-xs text-amber-900/80">
                {clinical.equation.tContributors.length ? (
                  clinical.equation.tContributors.map((c) => (
                    <li key={c.label}>
                      {c.label}: +{c.value}
                    </li>
                  ))
                ) : (
                  <li>No genetic / intolerance brakes</li>
                )}
              </ul>
            </div>
            <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-4">
              <p className="text-xs font-bold uppercase text-rose-800">
                S — Structural risk
              </p>
              <p className="mt-2 text-3xl font-bold text-rose-900">
                {clinical.equation.S}
              </p>
              <ul className="mt-3 space-y-1 text-xs text-rose-900/80">
                {clinical.equation.sContributors.length ? (
                  clinical.equation.sContributors.map((c) => (
                    <li key={c.label}>
                      {c.label}: +{c.value}
                    </li>
                  ))
                ) : (
                  <li>Low structural risk</li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
            <span className="text-2xl font-bold text-slate-700">V =</span>
            <span className="text-3xl font-bold text-emerald-700">
              {clinical.equation.E}
            </span>
            <span className="text-2xl text-slate-400">/</span>
            <span className="text-xl text-slate-600">
              ({clinical.equation.T} + {clinical.equation.S})
            </span>
            <span className="text-2xl font-bold text-slate-400">=</span>
            <span className="text-4xl font-bold text-blue-700">
              {clinical.equation.V.toFixed(2)}
            </span>
          </div>

          <p className="mt-6 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-800">
            {clinical.equation.clinicalRule}
          </p>
        </ReportSection>

        {/* Safety flags */}
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6">
          <h3 className="font-bold text-red-900">Active safety flags</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-red-800">
            {r.safetyFlags.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>

        {/* Clinician notes */}
        <section className="no-print rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-[#1e3a5f]">Clinician notes</h3>
          <textarea
            className="mt-4 w-full min-h-[120px] rounded-xl border border-slate-200 p-4 text-sm"
            placeholder="Add visit notes, labs ordered, or titration plan…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
          />
        </section>

        <footer className="border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          <p>{CLINICIAN_SUPPORT_FRAMING}</p>
          <p className="mt-2">{FOOTER_DISCLAIMER}</p>
        </footer>
      </div>
    </article>
  );
}
