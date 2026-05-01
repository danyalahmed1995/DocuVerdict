"use client";

import { useState } from "react";
import { ExportReportButton } from "@/components/ExportReportButton";
import { GroundTruthCard } from "@/components/GroundTruthCard";
import { JsonViewer } from "@/components/JsonViewer";
import { ScoreCard } from "@/components/ScoreCard";
import { UploadPanel } from "@/components/UploadPanel";
import type { AnalyzeResponse } from "@/lib/types";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [expectedJsonFile, setExpectedJsonFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runAnalysis() {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    if (expectedJsonFile) {
      formData.append("expectedJson", expectedJsonFile);
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Analysis failed.");
      }

      setResult(payload);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-3 border-b border-ink/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-normal text-ink md:text-4xl">DocuVerdict</h1>
            <p className="mt-2 text-base text-ink/65">AI Document Extraction QA Workbench</p>
          </div>
          <div className="rounded-lg border border-ink/10 bg-white px-4 py-3 text-sm text-ink/65">
            Invoice MVP · Groq · Zod
          </div>
        </header>

        <UploadPanel
          file={file}
          expectedJsonFile={expectedJsonFile}
          loading={loading}
          onFileChange={setFile}
          onExpectedJsonChange={setExpectedJsonFile}
          onSubmit={runAnalysis}
        />

        {error ? (
          <div className="mt-5 rounded-lg border border-clay/30 bg-clay/10 p-4 text-sm text-clay">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-5 rounded-lg border border-steel/20 bg-white p-5 shadow-soft">
            <div className="h-2 overflow-hidden rounded-full bg-paper">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-steel" />
            </div>
            <p className="mt-3 text-sm text-ink/60">Extracting PDF text, calling Groq, and scoring the result.</p>
          </div>
        ) : null}

        {result ? (
          <div className="mt-6 grid gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
              <div>
                <p className="text-sm font-semibold text-ink">Latest Analysis</p>
                <p className="mt-1 text-sm text-ink/60">{file?.name ?? "Document"} is ready to export.</p>
              </div>
              <ExportReportButton fileName={file?.name ?? null} result={result} />
            </div>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
              <JsonViewer data={result.extractedJson} />
              <ScoreCard report={result.report} />
            </div>
            <GroundTruthCard result={result.groundTruth} />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-ink/10 bg-white p-4">
              <p className="text-sm font-semibold text-ink">Extract</p>
              <p className="mt-2 text-sm text-ink/60">Reads selectable PDF text and asks Groq for strict invoice JSON.</p>
            </div>
            <div className="rounded-lg border border-ink/10 bg-white p-4">
              <p className="text-sm font-semibold text-ink">Validate</p>
              <p className="mt-2 text-sm text-ink/60">Checks required fields, types, unexpected keys, and weak values.</p>
            </div>
            <div className="rounded-lg border border-ink/10 bg-white p-4">
              <p className="text-sm font-semibold text-ink">Score</p>
              <p className="mt-2 text-sm text-ink/60">Flags math inconsistencies and returns a clear verdict out of 100.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
