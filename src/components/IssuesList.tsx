import type { QAIssue, Severity } from "@/lib/types";

const severityStyles: Record<Severity, string> = {
  critical: "border-clay/35 bg-clay/10 text-clay",
  warning: "border-amber-500/35 bg-amber-500/10 text-amber-800",
  info: "border-steel/35 bg-steel/10 text-steel",
};

const labels: Record<Severity, string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
};

type IssuesListProps = {
  issues: QAIssue[];
};

export function IssuesList({ issues }: IssuesListProps) {
  const grouped = {
    critical: issues.filter((item) => item.severity === "critical"),
    warning: issues.filter((item) => item.severity === "warning"),
    info: issues.filter((item) => item.severity === "info"),
  };

  return (
    <div className="space-y-4">
      {(Object.keys(grouped) as Severity[]).map((severity) => (
        <div key={severity}>
          <div className="mb-2 flex items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${severityStyles[severity]}`}>
              {labels[severity]}
            </span>
            <span className="text-sm text-ink/55">{grouped[severity].length}</span>
          </div>

          {grouped[severity].length > 0 ? (
            <ul className="space-y-2">
              {grouped[severity].map((item, index) => (
                <li key={`${item.path}-${index}`} className="rounded-lg border border-ink/10 bg-paper/70 p-3">
                  <p className="text-sm font-semibold text-ink">{item.path}</p>
                  <p className="mt-1 text-sm text-ink/70">{item.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-ink/10 bg-paper/70 p-3 text-sm text-ink/55">
              No {labels[severity].toLowerCase()} issues.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
