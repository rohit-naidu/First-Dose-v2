type AncillaryRecommendationsProps = {
  recommendations: string[];
};

export function AncillaryRecommendations({
  recommendations,
}: AncillaryRecommendationsProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="card-clinical">
      <h3 className="text-lg font-semibold text-[#1e3a5f]">
        Ancillary Support Recommendations
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        Clinician-support suggestions — not direct treatment orders.
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
        {recommendations.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
