"use client";

type Choice = {
  value: string;
  label: string;
  description?: string;
  emoji?: string;
};

type ChoiceGridProps = {
  choices: Choice[];
  value: string;
  onChange: (value: string) => void;
  columns?: 1 | 2;
};

export function ChoiceGrid({
  choices,
  value,
  onChange,
  columns = 1,
}: ChoiceGridProps) {
  return (
    <div
      className={`grid gap-3 ${
        columns === 2 ? "sm:grid-cols-2" : "grid-cols-1"
      }`}
    >
      {choices.map((choice) => {
        const selected = value === choice.value;
        return (
          <button
            key={choice.value}
            type="button"
            onClick={() => onChange(choice.value)}
            className={`group relative w-full rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
              selected
                ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100 scale-[1.02]"
                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start gap-3">
              {choice.emoji && (
                <span className="text-2xl" aria-hidden>
                  {choice.emoji}
                </span>
              )}
              <div className="flex-1">
                <span
                  className={`block font-semibold ${
                    selected ? "text-blue-900" : "text-slate-800"
                  }`}
                >
                  {choice.label}
                </span>
                {choice.description && (
                  <span className="mt-1 block text-sm text-slate-500">
                    {choice.description}
                  </span>
                )}
              </div>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                  selected
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {selected && (
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
