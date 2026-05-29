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
      <main className="retro-report-page">
        <p style={{ textAlign: "center", fontFamily: "var(--font-mono)" }}>Loading report…</p>
      </main>
    );
  }

  if (!intake) {
    return (
      <main className="retro-report-page">
        <p style={{ textAlign: "center", fontFamily: "var(--font-mono)" }}>Report not found.</p>
        <p style={{ textAlign: "center", fontSize: "0.8rem" }}>
          <Link href="/intake" className="retro-btn">
            Start new intake
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="retro-report-page">
      <div className="retro-report-toolbar no-print">
        <p>Report ready — clinician copy</p>
        <div className="retro-report-toolbar-actions">
          <PDFExportButton />
          <button type="button" className="retro-btn" onClick={copyLink}>
            {copied ? "Copied" : "Copy link"}
          </button>
          <Link href="/intake" className="retro-btn">
            Edit intake
          </Link>
        </div>
      </div>
      <p className="no-print" style={{ maxWidth: "52rem", margin: "0 auto 0.75rem", fontSize: "0.65rem", fontFamily: "var(--font-mono)" }}>
        {SHARE_LINK_LIMITATION}
      </p>

      <ClinicianReportPreview intake={intake} showActions={false} />
    </main>
  );
}
