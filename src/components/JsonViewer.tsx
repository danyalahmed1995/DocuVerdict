type JsonViewerProps = {
  data: unknown;
};

export function JsonViewer({ data }: JsonViewerProps) {
  return (
    <section className="h-full rounded-lg border border-ink/10 bg-white shadow-soft">
      <div className="border-b border-ink/10 px-5 py-4">
        <h2 className="text-base font-semibold text-ink">Extracted JSON</h2>
      </div>
      <pre className="max-h-[620px] overflow-auto p-5 text-sm leading-6 text-ink">
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
}
