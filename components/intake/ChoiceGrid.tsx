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
      className={`intake-choice-grid ${columns === 2 ? "intake-choice-grid--2" : ""}`}
    >
      {choices.map((choice) => {
        const selected = value === choice.value;
        return (
          <button
            key={choice.value}
            type="button"
            onClick={() => onChange(choice.value)}
            className={`intake-choice ${selected ? "intake-choice--selected" : ""}`}
          >
            <div className="intake-choice-inner">
              {choice.emoji && (
                <span className="intake-choice-emoji" aria-hidden>
                  {choice.emoji}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <span className="intake-choice-label">{choice.label}</span>
                {choice.description && (
                  <span className="intake-choice-desc">{choice.description}</span>
                )}
              </div>
              <span className="intake-choice-mark" aria-hidden>
                {selected && (
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
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
