"use client";

import { useRef } from "react";

type UploadPanelProps = {
  file: File | null;
  expectedJsonFile: File | null;
  loading: boolean;
  onFileChange: (file: File | null) => void;
  onExpectedJsonChange: (file: File | null) => void;
  onSubmit: () => void;
};

export function UploadPanel({
  file,
  expectedJsonFile,
  loading,
  onFileChange,
  onExpectedJsonChange,
  onSubmit,
}: UploadPanelProps) {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">PDF Upload</h2>
          <p className="mt-1 text-sm text-ink/60">Upload a selectable invoice PDF for extraction QA.</p>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!file || loading}
          className="rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/35"
        >
          {loading ? "Running..." : "Run Extraction QA"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => pdfInputRef.current?.click()}
        className="mt-5 flex min-h-44 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-steel/35 bg-paper/70 px-4 text-center transition hover:border-steel hover:bg-paper"
      >
        <span className="text-sm font-semibold text-steel">{file ? file.name : "Choose a PDF invoice"}</span>
        <span className="mt-2 text-sm text-ink/55">
          {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected` : "Text-based PDFs only. OCR is not included."}
        </span>
      </button>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink">Expected JSON</p>
          <p className="text-xs text-ink/50">Optional</p>
        </div>
        <button
          type="button"
          onClick={() => jsonInputRef.current?.click()}
          className="flex min-h-28 w-full flex-col items-center justify-center rounded-lg border border-dashed border-ink/20 bg-white px-4 text-center transition hover:border-steel hover:bg-paper/60"
        >
          <span className="text-sm font-semibold text-steel">
            {expectedJsonFile ? expectedJsonFile.name : "Choose expected JSON"}
          </span>
          <span className="mt-2 text-sm text-ink/55">
            {expectedJsonFile
              ? `${(expectedJsonFile.size / 1024).toFixed(1)} KB selected`
              : "Upload one expected object or a filename-keyed map."}
          </span>
        </button>
      </div>

      <input
        ref={pdfInputRef}
        className="hidden"
        type="file"
        accept="application/pdf,.pdf"
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
      />
      <input
        ref={jsonInputRef}
        className="hidden"
        type="file"
        accept="application/json,.json"
        onChange={(event) => onExpectedJsonChange(event.target.files?.[0] ?? null)}
      />
    </section>
  );
}
