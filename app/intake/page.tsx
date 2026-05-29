import { Suspense } from "react";
import { IntakeWizard } from "@/components/IntakeWizard";

export default function IntakePage() {
  return (
    <main>
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
            Loading intake…
          </div>
        }
      >
        <IntakeWizard />
      </Suspense>
    </main>
  );
}
