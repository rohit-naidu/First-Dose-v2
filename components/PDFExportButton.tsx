"use client";

export function PDFExportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="retro-btn retro-btn--primary no-print"
    >
      Print / Save PDF
    </button>
  );
}
