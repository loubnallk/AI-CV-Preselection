"use client";

import { useState } from "react";

import AnalyzeButton from "@/components/AnalyzeButton";
import CvUpload from "@/components/CvUpload";
import JobDescriptionForm from "@/components/JobDescriptionForm";
import RankingResults from "@/components/RankingResults";
import { analyzeCvs, type AnalyzeResult } from "@/lib/api";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const [results, setResults] = useState<AnalyzeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = jobDescription.trim().length > 0 && cvFiles.length > 0;

  async function handleAnalyze() {
    if (!canAnalyze || loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await analyzeCvs(jobDescription.trim(), cvFiles);
      setResults(response.results);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Une erreur inattendue est survenue.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            AI CV Preselection
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Analysez et classez des CV par pertinence par rapport à une offre
            d&apos;emploi.
          </p>
        </header>

        <section className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <JobDescriptionForm
            value={jobDescription}
            onChange={setJobDescription}
            disabled={loading}
          />

          <CvUpload files={cvFiles} onChange={setCvFiles} disabled={loading} />

          <div className="flex items-center gap-4">
            <AnalyzeButton
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              loading={loading}
            />
            {loading && (
              <p className="text-sm text-zinc-500">
                Analyse en cours, cela peut prendre quelques secondes...
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}
        </section>

        <RankingResults results={results} />
      </main>
    </div>
  );
}
