"use client";

import type { IntakeResponse } from "@/lib/types";
import { PrecisionClinicalReport } from "@/components/report/PrecisionClinicalReport";

type ClinicianReportPreviewProps = {
  intake: IntakeResponse;
  showActions?: boolean;
};

/** Delegates to the full precision clinical protocol report */
export function ClinicianReportPreview(props: ClinicianReportPreviewProps) {
  return <PrecisionClinicalReport {...props} />;
}
