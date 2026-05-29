import { NextRequest, NextResponse } from "next/server";
import { parseGeneticsFile } from "@/lib/genetics";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const consent = formData.get("consent") === "true";

    if (!consent) {
      return NextResponse.json(
        { error: "Consent is required before genetic analysis." },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const allowed = [".txt", ".csv", ".tsv", ".zip"];
    const name = file.name.toLowerCase();
    if (!allowed.some((ext) => name.endsWith(ext))) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload .txt, .csv, .tsv, or .zip raw genotype data.",
        },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const result = await parseGeneticsFile(buffer, file.name);

    return NextResponse.json({
      sourceFormat: result.sourceFormat,
      variants: result.variants,
      compoundRisk: result.compoundRisk,
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Unable to read this genetic file. Please upload raw genotype data from 23andMe, AncestryDNA, MyHeritage, or another provider.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
