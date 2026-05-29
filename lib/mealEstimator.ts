import type { ConfidenceLevel, MealEstimate } from "./types";

/** Food keyword → default kcal (mock heuristic; swap for OpenAI later) */
const FOOD_CALORIES: { keywords: string[]; food: string; kcal: number; assumption: string }[] = [
  { keywords: ["rice"], food: "Rice", kcal: 300, assumption: "Estimated ~1 cup cooked rice" },
  { keywords: ["chicken", "pollo"], food: "Chicken", kcal: 180, assumption: "Estimated ~6 oz chicken" },
  { keywords: ["beef", "steak"], food: "Beef", kcal: 250, assumption: "Estimated ~6 oz beef" },
  { keywords: ["beans"], food: "Beans", kcal: 120, assumption: "Estimated ~1/2 cup beans" },
  { keywords: ["cheese"], food: "Cheese", kcal: 110, assumption: "Estimated standard cheese portion" },
  { keywords: ["sour cream", "sourcream"], food: "Sour cream", kcal: 120, assumption: "Estimated 2 tbsp sour cream" },
  { keywords: ["guac", "guacamole"], food: "Guacamole", kcal: 230, assumption: "Estimated standard guacamole portion" },
  { keywords: ["chips", "tortilla chips"], food: "Chips", kcal: 540, assumption: "Estimated side of chips" },
  { keywords: ["soda", "coke", "pepsi", "dr pepper"], food: "Soda", kcal: 150, assumption: "Estimated regular soda" },
  { keywords: ["burrito", "bowl", "chipotle"], food: "Burrito bowl base", kcal: 200, assumption: "Bowl/base components" },
  { keywords: ["pizza"], food: "Pizza", kcal: 800, assumption: "Estimated 2–3 slices" },
  { keywords: ["pasta"], food: "Pasta", kcal: 400, assumption: "Estimated standard pasta serving" },
  { keywords: ["salad"], food: "Salad", kcal: 150, assumption: "Estimated salad with light dressing" },
  { keywords: ["bread", "toast"], food: "Bread", kcal: 160, assumption: "Estimated 2 slices" },
  { keywords: ["egg", "eggs"], food: "Eggs", kcal: 140, assumption: "Estimated 2 eggs" },
  { keywords: ["avocado"], food: "Avocado", kcal: 160, assumption: "Estimated half avocado" },
  { keywords: ["fries", "french fries"], food: "French fries", kcal: 400, assumption: "Estimated medium fries" },
  { keywords: ["burger"], food: "Burger", kcal: 550, assumption: "Estimated single burger with bun" },
  { keywords: ["ice cream"], food: "Ice cream", kcal: 300, assumption: "Estimated 1 cup ice cream" },
  { keywords: ["sweet", "candy", "chocolate", "dessert"], food: "Dessert/sweets", kcal: 250, assumption: "Estimated dessert portion" },
];

function interpretCalories(total: number): string {
  if (total < 1000)
    return "Lower fullness threshold; may not strongly support Hungry Brain pattern.";
  if (total <= 1500)
    return "Moderate fullness threshold; possible mild Hungry Brain signal.";
  if (total <= 2000)
    return "This suggests a higher-than-average fullness threshold.";
  return "High-calorie fullness threshold; possible Hungry Brain pattern.";
}

function confidenceFromMatchCount(matchCount: number, textLength: number): ConfidenceLevel {
  if (matchCount >= 3 && textLength > 40) return "high";
  if (matchCount >= 1) return "medium";
  return "low";
}

/**
 * Mock meal calorie estimator — keyword heuristic.
 * Same interface as future OpenAI-backed implementation.
 */
export async function estimateMealCalories(
  description: string
): Promise<MealEstimate> {
  const text = description.toLowerCase();
  const items: MealEstimate["items"] = [];
  const matched = new Set<string>();

  for (const entry of FOOD_CALORIES) {
    if (entry.keywords.some((kw) => text.includes(kw))) {
      if (!matched.has(entry.food)) {
        matched.add(entry.food);
        let kcal = entry.kcal;
        if (text.includes("large") || text.includes("extra")) kcal = Math.round(kcal * 1.3);
        if (text.includes("small") || text.includes("half")) kcal = Math.round(kcal * 0.6);
        items.push({
          food: entry.food,
          estimatedCalories: kcal,
          assumption: entry.assumption,
        });
      }
    }
  }

  // Default portion if nothing matched
  if (items.length === 0) {
    items.push({
      food: "Mixed meal (estimated)",
      estimatedCalories: 800,
      assumption: "No specific items detected; used average meal estimate",
    });
  }

  const totalCalories = items.reduce((sum, i) => sum + i.estimatedCalories, 0);
  const assumptions = items.map((i) => i.assumption);
  const confidence = confidenceFromMatchCount(items.length, description.length);

  return {
    totalCalories,
    confidence,
    items,
    assumptions,
    interpretation: interpretCalories(totalCalories),
  };
}
