"use client";

import { Printer } from "lucide-react";

export function PDFExportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-6 py-3 font-medium text-white hover:bg-[#2a4a6f]"
    >
      <Printer className="h-5 w-5" />
      Download PDF
    </button>
  );
}
