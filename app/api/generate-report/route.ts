import { NextRequest, NextResponse } from "next/server";
import { finalizeIntake } from "@/lib/reportGenerator";
import type { IntakeResponse } from "@/lib/types";
import { validateReportReady } from "@/lib/validation";

/** Optional server-side report generation fallback */
export async function POST(request: NextRequest) {
  try {
    const draft = (await request.json()) as IntakeResponse;
    const validation = validateReportReady(draft);
    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }
    const intake = finalizeIntake(draft);
    return NextResponse.json(intake);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate report." },
      { status: 500 }
    );
  }
}
