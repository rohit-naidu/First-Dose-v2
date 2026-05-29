"use client";

type MealDescriptionBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onEstimate: () => void;
  loading?: boolean;
};

export function MealDescriptionBox({
  value,
  onChange,
  onEstimate,
  loading,
}: MealDescriptionBoxProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">
        Describe a meal where you finally felt physically full. What did you eat,
        how much, and how long did it take to feel full?
      </label>
      <textarea
        className="mt-2 w-full min-h-[160px] rounded-2xl border-2 border-slate-200 bg-white p-5 text-lg leading-relaxed focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
        placeholder="Example: I ate a burrito bowl with rice, beans, chicken, guac, chips, and a soda. I still felt like I could keep eating after finishing it."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={onEstimate}
        disabled={loading || !value.trim()}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 font-semibold text-white shadow-md transition hover:brightness-105 disabled:opacity-50"
      >
        {loading ? "AI is estimating portion sizes…" : "Estimate calories with AI"}
      </button>
    </div>
  );
}
