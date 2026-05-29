# First Dose v2 — GLP-1 Precision Dosing

Interactive patient intake, scoring engine, and clinician-facing report generator.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- Multi-step precision intake wizard
- Mock AI meal calorie estimation (swap for OpenAI via `OPENAI_API_KEY`)
- Genetic raw file parser (23andMe, AncestryDNA, etc.)
- Phenotype + tolerability + structural risk scoring
- Clinician-support report with PDF print export
- localStorage persistence (MVP — same browser only)

## Test genetic file

Use `public/samples/sample-23andme.txt` when testing genetic upload.

## Environment

Copy `.env.example` to `.env.local` and add `OPENAI_API_KEY` when ready for real AI meal estimates.

## Disclaimer

For clinician-support and educational purposes only. Not medical advice.
