import type { QAReport } from "@/lib/types";
import { IssuesList } from "@/components/IssuesList";

type ScoreCardProps = {
  report: QAReport;
};

function scoreColor(score: number): string {
  if (score >= 90) return "bg-moss text-white";
  if (score >= 75) return "bg-steel text-white";
  if (score >= 50) return "bg-amber-500 text-ink";
  return "bg-clay text-white";
}

export function ScoreCard({ report }: ScoreCardProps) {
  const isPossiblyNotInvoice = report.documentFit.status === "Possibly not invoice";

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">QA Report</h2>
          <p className="mt-1 text-sm text-ink/60">Invoice schema validation and math consistency checks.</p>
        </div>
        <div className={`rounded-lg px-4 py-3 text-center ${scoreColor(report.score)}`}>
          <div className="text-3xl font-bold leading-none">{report.score}</div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wide">{report.grade}</div>
        </div>
      </div>

      <div
        className={`mt-5 rounded-lg border p-4 ${
          isPossiblyNotInvoice
            ? "border-amber-500/35 bg-amber-500/10"
            : "border-moss/25 bg-moss/10"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase text-ink/50">Document type fit</p>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              isPossiblyNotInvoice ? "bg-amber-500 text-ink" : "bg-moss text-white"
            }`}
          >
            {report.documentFit.status}
          </span>
        </div>
        {report.documentFit.warning ? (
          <p className="mt-3 text-sm font-medium text-amber-900">{report.documentFit.warning}</p>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg bg-paper p-3">
          <p className="text-xs uppercase text-ink/50">Missing</p>
          <p className="mt-1 text-xl font-semibold">{report.missingFields.length}</p>
        </div>
        <div className="rounded-lg bg-paper p-3">
          <p className="text-xs uppercase text-ink/50">Type mismatches</p>
          <p className="mt-1 text-xl font-semibold">{report.typeMismatches.length}</p>
        </div>
        <div className="rounded-lg bg-paper p-3">
          <p className="text-xs uppercase text-ink/50">Unexpected</p>
          <p className="mt-1 text-xl font-semibold">{report.unexpectedFields.length}</p>
        </div>
        <div className="rounded-lg bg-paper p-3">
          <p className="text-xs uppercase text-ink/50">Math issues</p>
          <p className="mt-1 text-xl font-semibold">{report.mathInconsistencies.length}</p>
        </div>
      </div>

      <div className="mt-6">
        <IssuesList issues={report.issues} />
      </div>
    </section>
  );
}
