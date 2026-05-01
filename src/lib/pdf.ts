import pdfParse from "pdf-parse";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const PDF_HEADER = Buffer.from("%PDF");
const PDF_HEADER_SCAN_BYTES = 1024;

type ParserName = "pdf-parse" | "pdfjs-dist";

function hasPdfHeader(bytes: Buffer): boolean {
  return bytes.subarray(0, PDF_HEADER_SCAN_BYTES).includes(PDF_HEADER);
}

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function logParserFailure(parser: ParserName, error: unknown, fileSize: number): void {
  const safeError =
    error instanceof Error
      ? { name: error.name, message: error.message }
      : { name: "UnknownError", message: "Unknown parser failure" };

  console.warn("PDF text parser failed", {
    parser,
    fileSize,
    errorName: safeError.name,
    errorMessage: safeError.message,
  });
}

async function extractWithPdfParse(bytes: Buffer): Promise<string> {
  const parsed = await pdfParse(bytes);
  return normalizeText(parsed.text);
}

async function extractWithPdfJs(bytes: Buffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const workerPath = join(
    process.cwd(),
    "node_modules",
    "pdfjs-dist",
    "legacy",
    "build",
    "pdf.worker.mjs",
  );
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(bytes),
    disableFontFace: true,
    useWorkerFetch: false,
    verbosity: pdfjs.VerbosityLevel.ERRORS,
  });
  const pdf = await loadingTask.promise;
  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .filter(Boolean)
      .join(" ");

    pageTexts.push(text);
  }

  return normalizeText(pageTexts.join("\n\n"));
}

export async function extractPdfTextFromBuffer(bytes: Buffer): Promise<string> {
  if (!hasPdfHeader(bytes)) {
    throw new Error("The uploaded file does not appear to be a valid PDF.");
  }

  const parserFailures: ParserName[] = [];

  try {
    const text = await extractWithPdfParse(bytes);
    if (text) {
      return text;
    }

    parserFailures.push("pdf-parse");
    logParserFailure("pdf-parse", new Error("Parser returned no selectable text."), bytes.length);
  } catch (error) {
    parserFailures.push("pdf-parse");
    logParserFailure("pdf-parse", error, bytes.length);
  }

  try {
    const text = await extractWithPdfJs(bytes);
    if (text) {
      return text;
    }

    parserFailures.push("pdfjs-dist");
    logParserFailure("pdfjs-dist", new Error("Parser returned no selectable text."), bytes.length);
  } catch (error) {
    parserFailures.push("pdfjs-dist");
    logParserFailure("pdfjs-dist", error, bytes.length);
  }

  if (parserFailures.length === 2) {
    throw new Error(
      "Could not extract selectable text from this PDF. Both text parsers failed; try re-saving or exporting the PDF, then upload it again.",
    );
  }

  throw new Error("No selectable text was found in this PDF. OCR is outside this MVP.");
}

export async function extractPdfText(file: File): Promise<string> {
  if (file.type && file.type !== "application/pdf") {
    throw new Error("Please upload a PDF file.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  return extractPdfTextFromBuffer(bytes);
}
