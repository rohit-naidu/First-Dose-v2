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
      <label
        className="block text-sm font-medium"
        style={{ marginBottom: "0.5rem", lineHeight: 1.45 }}
      >
        Describe a meal where you finally felt physically full. What did you eat,
        how much, and how long did it take to feel full?
      </label>
      <textarea
        className="intake-textarea"
        placeholder="Example: I ate a burrito bowl with rice, beans, chicken, guac, chips, and a soda. I still felt like I could keep eating after finishing it."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={onEstimate}
        disabled={loading || !value.trim()}
        className="intake-btn-primary"
      >
        {loading ? "Estimating portion sizes…" : "Estimate calories with AI"}
      </button>
    </div>
  );
}
