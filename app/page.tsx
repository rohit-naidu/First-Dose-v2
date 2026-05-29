import Link from "next/link";
import { DosingPipeline } from "@/components/DosingPipeline";
import {
  CLINICIAN_SUPPORT_FRAMING,
  NOT_PRESCRIBING,
  PRODUCT_POSITIONING,
} from "@/lib/disclaimers";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-blue-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-xl font-bold text-[#1e3a5f]">First Dose</span>
          <span className="text-sm text-slate-500">Precision GLP-1</span>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          Clinician-support platform
        </p>
        <h1 className="heading-navy mt-4 text-4xl font-bold leading-tight sm:text-5xl">
          Personalized GLP-1 dosing guidance, built around your biology.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Upload your questionnaire responses, meal patterns, and optional genetic
          file to generate a clinician-ready report suggesting a safer titration
          strategy.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/intake?fresh=true"
            className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
          >
            Try Demo Intake
          </Link>
          <Link
            href="/intake?fresh=true&step=genetics"
            className="rounded-xl border-2 border-blue-300 bg-white px-8 py-4 text-lg font-semibold text-blue-700 hover:bg-blue-50"
          >
            Demo + Genetics
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Opens with a pre-filled sample patient — no typing required for a walkthrough.
        </p>

        <ul className="mx-auto mt-10 max-w-xl space-y-2 text-left text-sm text-slate-600">
          <li className="flex gap-2">
            <span className="text-blue-500">✓</span>
            Designed to support clinician decision-making.
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500">✓</span>
            {NOT_PRESCRIBING}
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500">✓</span>
            Your genetic data is analyzed only for dosing-relevant variants.
          </li>
        </ul>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="card-clinical">
          <h2 className="heading-navy text-xl font-semibold">
            The missing precision layer
          </h2>
          <p className="mt-4 text-slate-700">{PRODUCT_POSITIONING}</p>
          <p className="mt-4 text-sm italic text-slate-500">
            {CLINICIAN_SUPPORT_FRAMING}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20">
        <h2 className="heading-navy mb-8 text-center text-xl font-semibold">
          How your report is built
        </h2>
        <DosingPipeline />
      </section>
    </main>
  );
}
