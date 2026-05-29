import type { IntakeResponse } from "@/lib/types";

type RetroPrintChromeProps = {
  intake: IntakeResponse;
  protocolLabel: string;
  velocity: number;
};

/** Document header strip — visible on screen and print */
export function RetroPrintChrome({
  intake,
  protocolLabel,
  velocity,
}: RetroPrintChromeProps) {
  const caseRef = `FD-${intake.id.slice(0, 8).toUpperCase()}`;
  const generated = new Date(intake.createdAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <>
      <div className="retro-print-chrome" aria-hidden>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>First Dose · Precision Protocol</span>
          <span>Rev. 2.1</span>
        </div>
        <hr className="retro-print-chrome__rule" />
        <p className="retro-print-chrome__title">Confidential · Clinician support</p>
        <div className="retro-print-chrome__grid">
          <div>
            <div>Case ref</div>
            <div style={{ fontWeight: 700 }}>{caseRef}</div>
          </div>
          <div>
            <div>Issued</div>
            <div style={{ fontWeight: 700 }}>{generated}</div>
          </div>
          <div>
            <div>Protocol</div>
            <div style={{ fontWeight: 700 }}>V={velocity.toFixed(2)}</div>
          </div>
        </div>
        <div style={{ marginTop: "0.35rem" }}>
          <span className="retro-print-stamp">{protocolLabel.split("/")[0]?.trim()}</span>
        </div>
      </div>

      <div className="retro-print-footer" aria-hidden>
        {caseRef} · First Dose · Clinician copy only
      </div>
    </>
  );
}
