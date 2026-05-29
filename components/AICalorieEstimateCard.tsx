"use client";

import type { MealEstimate } from "@/lib/types";
import { AI_MEAL_DISCLAIMER } from "@/lib/disclaimers";

type AICalorieEstimateCardProps = {
  estimate: MealEstimate | null;
  editedCalories: number | "";
  onEditCalories: (value: number | "") => void;
};

export function AICalorieEstimateCard({
  estimate,
  editedCalories,
  onEditCalories,
}: AICalorieEstimateCardProps) {
  if (!estimate) return null;

  const displayCal =
    editedCalories !== "" ? editedCalories : estimate.totalCalories;

  return (
    <div className="mt-6 rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#1e3a5f]">AI Calorie Estimate</h3>
      <p className="mt-2 text-2xl font-bold text-blue-700">
        ~{displayCal.toLocaleString()} kcal
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Confidence:{" "}
        <span className="capitalize font-medium">{estimate.confidence}</span>
      </p>
      <p className="mt-3 text-slate-700">{estimate.interpretation}</p>

      {estimate.items.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-600">Breakdown:</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {estimate.items.map((item, i) => (
              <li key={i}>
                {item.food}: ~{item.estimatedCalories} kcal — {item.assumption}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <label className="text-sm font-medium text-slate-700">
          Edit estimate manually (optional)
        </label>
        <input
          type="number"
          className="mt-1 w-full max-w-xs rounded-lg border border-blue-200 px-3 py-2"
          placeholder={String(estimate.totalCalories)}
          value={editedCalories}
          onChange={(e) =>
            onEditCalories(e.target.value ? Number(e.target.value) : "")
          }
        />
      </div>

      <p className="mt-4 text-xs text-slate-500">{AI_MEAL_DISCLAIMER}</p>
    </div>
  );
}
