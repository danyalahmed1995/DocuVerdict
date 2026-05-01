import { NextResponse } from "next/server";
import { PromptTooLargeError, extractInvoiceWithGroq } from "@/lib/groq";
import {
  compareGroundTruth,
  getSkippedGroundTruthResult,
  selectExpectedJsonForFile,
} from "@/lib/groundTruth";
import { extractPdfText } from "@/lib/pdf";
import { validateAndScoreInvoice } from "@/lib/qaScoring";
import type { AnalyzeResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

async function parseExpectedJson(file: File): Promise<unknown> {
  try {
    return JSON.parse(await file.text());
  } catch {
    throw new Error("Expected JSON file is invalid. Please upload valid JSON.");
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const expectedJsonFile = formData.get("expectedJson");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload a PDF file using the 'file' field." }, { status: 400 });
    }

    const pdfText = await extractPdfText(file);
    const extractedJson = await extractInvoiceWithGroq(pdfText);
    const report = validateAndScoreInvoice(extractedJson);
    const groundTruth =
      expectedJsonFile instanceof File && expectedJsonFile.size > 0
        ? compareGroundTruth(
            extractedJson,
            selectExpectedJsonForFile(await parseExpectedJson(expectedJsonFile), file.name),
          )
        : getSkippedGroundTruthResult();

    const response: AnalyzeResponse = {
      extractedJson,
      report,
      groundTruth,
      sourceTextPreview: pdfText.slice(0, 1200),
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed.";
    const status =
      error instanceof PromptTooLargeError
        ? error.statusCode
        : message === "Expected JSON file is invalid. Please upload valid JSON."
          ? 400
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
