"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ClinicianReportPreview } from "@/components/ClinicianReportPreview";
import { PDFExportButton } from "@/components/PDFExportButton";
import { getIntakeById } from "@/lib/storage";
import type { IntakeResponse } from "@/lib/types";
import { SHARE_LINK_LIMITATION } from "@/lib/disclaimers";

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [intake, setIntake] = useState<IntakeResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIntake(getIntakeById(id));
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (intake === null) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-slate-600">Loading report…</p>
      </main>
    );
  }

  if (!intake) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="heading-navy text-2xl font-bold">Report not found</h1>
        <p className="mt-4 text-slate-600">
          This report may have been opened on a different browser or device.
          Reports are stored locally on the device where they were created.
        </p>
        <Link
          href="/intake"
          className="mt-8 inline-block rounded-xl bg-blue-600 px-6 py-3 text-white"
        >
          Start new intake
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 bg-gradient-to-b from-slate-100 to-slate-50 min-h-screen">
      <div className="no-print mb-8 rounded-2xl border border-green-200 bg-green-50 p-6">
        <h1 className="text-2xl font-bold text-green-900">
          Your precision dosing report is ready.
        </h1>
        <p className="mt-2 text-green-800">
          Bring this to your clinician to discuss suggested titration velocity,
          genetic tolerability signals, phenotype-specific considerations, side-effect
          prevention, and muscle-preservation support.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <PDFExportButton />
          <button
            type="button"
            onClick={copyLink}
            className="rounded-xl border border-green-300 bg-white px-6 py-3 font-medium text-green-800 hover:bg-green-100"
          >
            {copied ? "Link copied!" : "Share with clinician"}
          </button>
          <Link
            href="/intake"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit answers
          </Link>
          <Link
            href="/intake?step=genetics"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            Upload genetic file
          </Link>
        </div>
        <p className="mt-4 text-xs text-green-700">{SHARE_LINK_LIMITATION}</p>
      </div>

      <ClinicianReportPreview intake={intake} />
    </main>
  );
}
