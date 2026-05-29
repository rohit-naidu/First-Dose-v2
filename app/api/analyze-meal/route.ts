import { NextRequest, NextResponse } from "next/server";
import { estimateMealCalories } from "@/lib/mealEstimator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const description = body?.description as string;

    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "Meal description is required." },
        { status: 400 }
      );
    }

    const estimate = await estimateMealCalories(description.trim());

    return NextResponse.json({
      estimatedCalories: estimate.totalCalories,
      confidence: estimate.confidence,
      assumptions: estimate.assumptions,
      satietyInterpretation: estimate.interpretation,
      items: estimate.items,
      interpretation: estimate.interpretation,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not estimate calories automatically. Please enter your best estimate manually.",
      },
      { status: 422 }
    );
  }
}
