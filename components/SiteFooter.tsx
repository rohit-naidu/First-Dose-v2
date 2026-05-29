import { FOOTER_DISCLAIMER, NOT_PRESCRIBING } from "@/lib/disclaimers";

export function SiteFooter() {
  return (
    <footer className="no-print mt-16 border-t border-blue-100 bg-white/80 px-4 py-8 text-center text-sm text-slate-600">
      <p className="font-medium text-slate-700">{NOT_PRESCRIBING}</p>
      <p className="mx-auto mt-2 max-w-2xl">{FOOTER_DISCLAIMER}</p>
    </footer>
  );
}
