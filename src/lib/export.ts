import type { AnalyzeResponse } from "@/lib/types";

export type ExportReport = {
  timestamp: string;
  fileName: string;
  extracted: unknown;
  qa: AnalyzeResponse["report"];
  groundTruth: AnalyzeResponse["groundTruth"] | null;
};

export function createExportReport(result: AnalyzeResponse, fileName: string, timestamp = new Date()): ExportReport {
  return {
    timestamp: timestamp.toISOString(),
    fileName,
    extracted: result.extractedJson,
    qa: result.report,
    groundTruth: result.groundTruth.enabled ? result.groundTruth : null,
  };
}

export function createReportFilename(originalFileName: string, timestamp = new Date()): string {
  const safeFileName = originalFileName.replace(/[^a-z0-9._-]+/gi, "-").replace(/-+/g, "-");
  const safeTimestamp = timestamp.toISOString().replace(/[:.]/g, "-");

  return `docuverdict-report-${safeFileName}-${safeTimestamp}.json`;
}

export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
