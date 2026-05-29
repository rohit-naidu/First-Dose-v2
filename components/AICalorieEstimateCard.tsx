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
    <div className="intake-meal-card">
      <h3>AI calorie estimate</h3>
      <p className="intake-meal-kcal">~{displayCal.toLocaleString()} kcal</p>
      <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
        Confidence:{" "}
        <span style={{ fontWeight: 600, textTransform: "capitalize" }}>
          {estimate.confidence}
        </span>
      </p>
      <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", lineHeight: 1.45 }}>
        {estimate.interpretation}
      </p>

      {estimate.items.length > 0 && (
        <div style={{ marginTop: "0.65rem" }}>
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Breakdown
          </p>
          <ul style={{ marginTop: "0.35rem", paddingLeft: "1rem", fontSize: "0.8rem" }}>
            {estimate.items.map((item, i) => (
              <li key={i} style={{ marginBottom: "0.2rem" }}>
                {item.food}: ~{item.estimatedCalories} kcal — {item.assumption}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: "0.75rem" }}>
        <label
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Edit estimate manually (optional)
        </label>
        <input
          type="number"
          className="intake-input"
          style={{ marginTop: "0.35rem", maxWidth: "12rem" }}
          placeholder={String(estimate.totalCalories)}
          value={editedCalories}
          onChange={(e) =>
            onEditCalories(e.target.value ? Number(e.target.value) : "")
          }
        />
      </div>

      <p className="intake-helper" style={{ textAlign: "left", marginTop: "0.65rem" }}>
        {AI_MEAL_DISCLAIMER}
      </p>
    </div>
  );
}
