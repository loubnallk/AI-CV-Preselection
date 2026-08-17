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
  const [hasSearched, setHasSearched] = useState(false);

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
      setHasSearched(true);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Une erreur inattendue est survenue.";
      setError(message);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-[var(--background)]">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:px-6 lg:px-8">
          <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Présélection IA
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            AI CV Preselection
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Classez des CV à partir d&apos;un score hybride combinant
            similarité sémantique et correspondance de compétences avec
            l&apos;offre. Outil d&apos;aide à la présélection, à valider
            manuellement avant entretien.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-5 lg:px-8 lg:py-10">
        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <JobDescriptionForm
            value={jobDescription}
            onChange={setJobDescription}
            disabled={loading}
          />

          <div className="h-px bg-slate-100" />

          <CvUpload files={cvFiles} onChange={setCvFiles} disabled={loading} />

          <div className="h-px bg-slate-100" />

          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                3. Lancer l&apos;analyse
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Le classement combine un score sémantique et un score
                compétences pour produire un résultat explicable par candidat.
              </p>
            </div>

            <AnalyzeButton
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              loading={loading}
            />

            {!canAnalyze && !loading && (
              <p className="text-sm text-slate-500">
                Ajoutez une description d&apos;offre et au moins un CV PDF pour
                activer l&apos;analyse.
              </p>
            )}

            {loading && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                Analyse en cours… L&apos;extraction, la vectorisation et le
                classement peuvent prendre quelques secondes.
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v5m0 4h.01" strokeLinecap="round" />
                </svg>
                <div>
                  <p className="font-semibold">Erreur lors de l&apos;analyse</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="lg:col-span-2">
          <RankingResults
            results={results}
            hasSearched={hasSearched}
            loading={loading}
            error={error}
          />
        </div>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          Plateforme de démonstration — scoring hybride sémantique et
          compétences
        </div>
      </footer>
    </div>
  );
}
