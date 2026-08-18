"use client";

import { useState } from "react";

import AnalyzeButton from "@/components/AnalyzeButton";
import CvUpload from "@/components/CvUpload";
import JobDescriptionForm from "@/components/JobDescriptionForm";
import PageEdgeDecorations from "@/components/PageEdgeDecorations";
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
    <div className="relative min-h-full bg-page-gradient bg-grain">
      <PageEdgeDecorations />

      <div className="relative z-10">
      <header className="relative overflow-hidden border-b border-[rgba(90,56,37,0.12)] bg-cream/80 backdrop-blur-md">
        <div
          aria-hidden="true"
          className="leopard-accent pointer-events-none absolute inset-0"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:px-6 lg:px-8">
          <span className="label-caps w-fit rounded-full border border-[var(--border-gold)] bg-champagne-beige/50 px-3 py-1 text-chocolate">
            Présélection IA
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-deep-brown sm:text-5xl">
            AI CV{" "}
            <span className="italic text-muted-gold">Preselection</span>
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-chocolate sm:text-base">
            Classez des CV à partir d&apos;un score hybride combinant
            similarité sémantique et correspondance de compétences avec
            l&apos;offre. Outil d&apos;aide à la présélection, à valider
            manuellement avant entretien.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-5 lg:px-8 lg:py-10">
        <section className="card-premium animate-fade-in-up space-y-6 rounded-2xl p-6 lg:col-span-3">
          <div className="animate-fade-in-up animate-stagger-1">
            <JobDescriptionForm
              value={jobDescription}
              onChange={setJobDescription}
              disabled={loading}
            />
          </div>

          <div className="divider-gold" />

          <div className="animate-fade-in-up animate-stagger-2">
            <CvUpload files={cvFiles} onChange={setCvFiles} disabled={loading} />
          </div>

          <div className="divider-gold" />

          <div className="animate-fade-in-up animate-stagger-3 space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-deep-brown">
                3. Lancer l&apos;analyse
              </h2>
              <p className="mt-1 text-sm leading-6 text-chocolate">
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
              <p className="text-sm text-chocolate/80">
                Ajoutez une description d&apos;offre et au moins un CV PDF pour
                activer l&apos;analyse.
              </p>
            )}

            {loading && (
              <div className="rounded-xl border border-[var(--border-gold)] bg-champagne-beige/40 px-4 py-3 text-sm text-deep-brown">
                Analyse en cours… L&apos;extraction, la vectorisation et le
                classement peuvent prendre quelques secondes.
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex gap-3 rounded-xl border border-chocolate/25 bg-champagne-beige/30 px-4 py-3 text-sm text-deep-brown"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="mt-0.5 h-5 w-5 shrink-0 text-muted-gold"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v5m0 4h.01" strokeLinecap="round" />
                </svg>
                <div>
                  <p className="font-semibold">Erreur lors de l&apos;analyse</p>
                  <p className="mt-1 text-chocolate">{error}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="animate-fade-in-up animate-stagger-2 lg:col-span-2">
          <RankingResults
            results={results}
            hasSearched={hasSearched}
            loading={loading}
            error={error}
          />
        </div>
      </main>

      <footer className="border-t border-[rgba(90,56,37,0.12)] bg-deep-brown/95">
        <div className="mx-auto max-w-6xl px-4 py-5 text-center text-xs tracking-wide text-champagne-gold/80 sm:px-6 lg:px-8">
          Plateforme de démonstration — scoring hybride sémantique et
          compétences
        </div>
      </footer>
      </div>
    </div>
  );
}
