import type { GroundTruthIssue, GroundTruthResult } from "@/lib/types";

type GroundTruthCardProps = {
  result: GroundTruthResult;
};

function formatValue(value: unknown): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "string") return value.trim() === "" ? "empty string" : value;
  const serialized = JSON.stringify(value);
  return serialized.length > 90 ? `${serialized.slice(0, 87)}...` : serialized;
}

function issueStyle(type: GroundTruthIssue["type"]): string {
  if (type === "match") return "border-moss/25 bg-moss/10";
  if (type === "extra") return "border-steel/25 bg-steel/10";
  return "border-clay/25 bg-clay/10";
}

export function GroundTruthCard({ result }: GroundTruthCardProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Ground Truth Comparison</h2>
          <p className="mt-1 text-sm text-ink/60">Field-level comparison against optional expected JSON.</p>
        </div>
        {result.enabled ? (
          <div className="rounded-lg bg-ink px-4 py-3 text-center text-white">
            <div className="text-3xl font-bold leading-none">{result.matchPercentage}%</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide">Match</div>
          </div>
        ) : null}
      </div>

      {!result.enabled ? (
        <p className="mt-5 rounded-lg border border-ink/10 bg-paper p-4 text-sm text-ink/65">
          No expected JSON provided. Skipping ground truth comparison.
        </p>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-lg bg-paper p-3">
              <p className="text-xs uppercase text-ink/50">Matched</p>
              <p className="mt-1 text-xl font-semibold">{result.matchedFields}</p>
            </div>
            <div className="rounded-lg bg-paper p-3">
              <p className="text-xs uppercase text-ink/50">Mismatched</p>
              <p className="mt-1 text-xl font-semibold">{result.mismatchedFields}</p>
            </div>
            <div className="rounded-lg bg-paper p-3">
              <p className="text-xs uppercase text-ink/50">Missing</p>
              <p className="mt-1 text-xl font-semibold">{result.missingFields}</p>
            </div>
            <div className="rounded-lg bg-paper p-3">
              <p className="text-xs uppercase text-ink/50">Extra</p>
              <p className="mt-1 text-xl font-semibold">{result.extraFields}</p>
            </div>
          </div>

          <div className="mt-5 max-h-[520px] space-y-2 overflow-auto pr-1">
            {result.issues.map((issue, index) => (
              <div key={`${issue.path}-${issue.type}-${index}`} className={`rounded-lg border p-3 ${issueStyle(issue.type)}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{issue.path}</p>
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold uppercase text-ink/60">
                    {issue.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink/70">{issue.message}</p>
                {issue.type !== "match" ? (
                  <div className="mt-2 grid gap-2 text-xs text-ink/60 md:grid-cols-2">
                    <p>
                      <span className="font-semibold">Expected:</span> {formatValue(issue.expected)}
                    </p>
                    <p>
                      <span className="font-semibold">Actual:</span> {formatValue(issue.actual)}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
