"use client";

import { createExportReport, createReportFilename, downloadJson } from "@/lib/export";
import type { AnalyzeResponse } from "@/lib/types";

type ExportReportButtonProps = {
  fileName: string | null;
  result: AnalyzeResponse | null;
};

export function ExportReportButton({ fileName, result }: ExportReportButtonProps) {
  const disabled = !fileName || !result;

  function handleExport() {
    if (!fileName || !result) return;

    const timestamp = new Date();
    const report = createExportReport(result, fileName, timestamp);
    downloadJson(report, createReportFilename(fileName, timestamp));
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled}
      className="rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-steel hover:text-steel disabled:cursor-not-allowed disabled:opacity-45"
    >
      Export Report
    </button>
  );
}
