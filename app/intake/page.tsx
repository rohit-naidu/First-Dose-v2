import { Suspense } from "react";
import { IntakeWizard } from "@/components/IntakeWizard";

export default function IntakePage() {
  return (
    <main>
      <Suspense
        fallback={
          <div
            className="intake-clinical-page flex min-h-[50vh] items-center justify-center"
            style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.75rem" }}
          >
            Loading intake…
          </div>
        }
      >
        <IntakeWizard />
      </Suspense>
    </main>
  );
}
