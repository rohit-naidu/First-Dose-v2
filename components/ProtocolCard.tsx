import type { ProtocolType } from "@/lib/types";
import { PROTOCOL_INFO } from "@/lib/dosingProtocols";
import { RiskBadge } from "./RiskBadge";

type ProtocolCardProps = {
  protocol: ProtocolType;
};

export function ProtocolCard({ protocol }: ProtocolCardProps) {
  const info = PROTOCOL_INFO[protocol];
  return (
    <div className="card-clinical border-2 border-blue-200">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-xl font-semibold text-[#1e3a5f]">
          Suggested Protocol
        </h3>
        <RiskBadge label={info.label} level={info.badgeColor} />
      </div>
      <p className="mt-4 text-slate-700">{info.description}</p>
      <p className="mt-3 text-sm text-slate-600">{info.titrationGuidance}</p>
      <p className="mt-4 text-xs italic text-slate-500">
        For clinician review — not a prescription or medical directive.
      </p>
    </div>
  );
}
