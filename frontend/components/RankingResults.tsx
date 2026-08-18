"use client";

import { useEffect, useState } from "react";

import type { AnalyzeResult } from "@/lib/api";

interface RankingResultsProps {
  results: AnalyzeResult[];
  hasSearched: boolean;
  loading: boolean;
  error?: string | null;
}

function formatScore(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

function formatWeight(weight: number): string {
  return `${Math.round(weight * 100)}%`;
}

function hasDetailedBreakdown(result: AnalyzeResult): boolean {
  return Boolean(result.score_breakdown);
}

function ScoreBar({
  score,
  highlight = false,
  label,
}: {
  score: number;
  highlight?: boolean;
  label?: string;
}) {
  const percentage = Math.max(0, Math.min(score * 100, 100));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(percentage));
    return () => cancelAnimationFrame(frame);
  }, [percentage]);

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between text-xs text-chocolate">
          <span>{label}</span>
          <span className="font-medium text-deep-brown">{formatScore(score)}</span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-champagne-beige/60">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ease-out ${
              highlight
                ? "bg-gradient-to-r from-muted-gold to-champagne-gold"
                : "bg-gradient-to-r from-chocolate/70 to-muted-gold"
            }`}
            style={{ width: `${width}%` }}
          />
        </div>
        {!label && (
          <span className="min-w-14 text-right text-sm font-semibold text-deep-brown">
            {formatScore(score)}
          </span>
        )}
      </div>
    </div>
  );
}

function SkillBadges({
  title,
  skills,
  variant,
}: {
  title: string;
  skills: string[];
  variant: "matched" | "missing";
}) {
  if (skills.length === 0) {
    return null;
  }

  const styles =
    variant === "matched"
      ? "border-[var(--border-gold)] bg-champagne-beige/50 text-deep-brown"
      : "border-dashed border-chocolate/30 bg-cream/80 text-chocolate";

  return (
    <div>
      <p className="label-caps mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={`${variant}-${skill}`}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${styles}`}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function ScoreDetails({
  result,
  highlight = false,
}: {
  result: AnalyzeResult;
  highlight?: boolean;
}) {
  const breakdown = result.score_breakdown;

  if (!breakdown) {
    return (
      <div className="w-full sm:max-w-sm">
        <ScoreBar score={result.score} highlight={highlight} label="Score final" />
      </div>
    );
  }

  const isSemanticOnly = breakdown.fallback === "semantic_only";

  return (
    <div className="space-y-4">
      <ScoreBar score={result.score} highlight={highlight} label="Score final" />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-champagne-beige/25 px-3 py-2">
          <p className="label-caps">Score sémantique</p>
          <p className="mt-1 text-sm font-semibold text-deep-brown">
            {formatScore(breakdown.semantic)}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-champagne-beige/25 px-3 py-2">
          <p className="label-caps">Score compétences</p>
          <p className="mt-1 text-sm font-semibold text-deep-brown">
            {breakdown.keywords !== null ? formatScore(breakdown.keywords) : "N/A"}
          </p>
        </div>
      </div>

      <p className="text-xs leading-5 text-chocolate">
        {isSemanticOnly ? (
          "Poids utilisés : 100% sémantique (aucune compétence détectée dans l'offre)."
        ) : (
          <>
            Poids utilisés : {formatWeight(breakdown.weights.semantic)} sémantique
            {" / "}
            {formatWeight(breakdown.weights.keywords)} compétences
          </>
        )}
      </p>
    </div>
  );
}

function ExcerptBlock({ excerpt }: { excerpt: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] border-l-[3px] border-l-muted-gold bg-champagne-beige/20 px-4 py-3">
      <p className="label-caps">Extrait le plus pertinent</p>
      <p className="font-display mt-2 text-sm italic leading-6 text-chocolate">
        &ldquo;{excerpt}&rdquo;
      </p>
    </div>
  );
}

function CandidateDetails({
  result,
  highlight = false,
}: {
  result: AnalyzeResult;
  highlight?: boolean;
}) {
  const matchedSkills = result.matched_skills ?? [];
  const missingSkills = result.missing_skills ?? [];
  const hasSkillsInfo =
    matchedSkills.length > 0 ||
    missingSkills.length > 0 ||
    (result.skills_required?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <ScoreDetails result={result} highlight={highlight} />

      {hasSkillsInfo && (
        <div className="grid gap-4">
          <SkillBadges title="Compétences trouvées" skills={matchedSkills} variant="matched" />
          <SkillBadges title="Compétences manquantes" skills={missingSkills} variant="missing" />
          {matchedSkills.length === 0 && missingSkills.length === 0 && (
            <p className="text-sm text-chocolate">
              Aucune compétence du dictionnaire détectée pour ce candidat.
            </p>
          )}
        </div>
      )}

      {result.best_match_excerpt && (
        <ExcerptBlock excerpt={result.best_match_excerpt} />
      )}
    </div>
  );
}

function TopCandidateCard({ result }: { result: AnalyzeResult }) {
  return (
    <article className="card-premium-highlight relative overflow-hidden rounded-2xl p-5 transition duration-300 hover:-translate-y-0.5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-16 w-16 leopard-accent rounded-bl-3xl"
      />
      <div className="relative space-y-4">
        <div>
          <span className="inline-flex rounded-full border border-muted-gold/60 bg-black px-3 py-1 text-xs font-semibold uppercase tracking-wide text-champagne-gold">
            Meilleur candidat
          </span>
          <p className="label-caps mt-3 text-muted-gold">Rang #{result.rank}</p>
          <h3 className="font-display mt-1 break-all text-xl font-semibold text-deep-brown">
            {result.filename}
          </h3>
          <p className="mt-1 text-sm leading-6 text-chocolate">
            {hasDetailedBreakdown(result)
              ? "Meilleure correspondance globale avec l'offre d'emploi."
              : "Correspondance la plus élevée avec l'offre d'emploi."}
          </p>
        </div>

        <CandidateDetails result={result} highlight />
      </div>
    </article>
  );
}

function AnalysisErrorState() {
  return (
    <div className="rounded-2xl border border-chocolate/25 bg-champagne-beige/30 px-5 py-4 text-sm text-deep-brown">
      <p className="font-semibold">Analyse interrompue</p>
      <p className="mt-1 text-chocolate">
        Le classement n&apos;a pas pu être généré. Consultez le message
        d&apos;erreur dans le formulaire pour corriger le problème, puis
        relancez l&apos;analyse.
      </p>
    </div>
  );
}

function CandidateRow({
  result,
  index,
}: {
  result: AnalyzeResult;
  index: number;
}) {
  return (
    <article
      className="card-premium animate-fade-in-up rounded-xl p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(36,26,21,0.1)]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border-gold)] bg-champagne-beige/40 text-sm font-bold text-chocolate">
            #{result.rank}
          </span>
          <div className="min-w-0 flex-1">
            <p className="break-all font-medium text-deep-brown">{result.filename}</p>
            <p className="text-xs text-chocolate/80">Candidat classé</p>
          </div>
        </div>

        <CandidateDetails result={result} />
      </div>
    </article>
  );
}

function EmptyResultsState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-muted-gold/40 bg-card/70 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border-gold)] bg-champagne-beige/40">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-7 w-7 text-muted-gold"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M4 19h16M6 16l3-8 3 4 3-6 3 10" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="font-display mt-4 text-lg font-semibold text-deep-brown">
        Aucun résultat pour le moment
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-chocolate">
        Renseignez une offre, importez des CV PDF, puis lancez l&apos;analyse
        pour afficher le classement ici.
      </p>
    </div>
  );
}

function NoMatchState() {
  return (
    <div className="rounded-2xl border border-chocolate/20 bg-champagne-beige/35 px-5 py-4 text-sm text-deep-brown">
      L&apos;analyse s&apos;est terminée, mais aucun candidat n&apos;a pu être
      classé.
    </div>
  );
}

function ResultsHeader({ count }: { count: number }) {
  return (
    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-display text-2xl font-semibold text-deep-brown">
          Résultats du <span className="italic text-muted-gold">classement</span>
        </h2>
        <p className="mt-1 text-sm text-chocolate">
          {count} candidat{count > 1 ? "s" : ""} analysé
          {count > 1 ? "s" : ""}, trié
          {count > 1 ? "s" : ""} par pertinence décroissante.
        </p>
      </div>
    </div>
  );
}

export default function RankingResults({
  results,
  hasSearched,
  loading,
  error = null,
}: RankingResultsProps) {
  if (loading) {
    return (
      <section className="mt-8">
        <div className="card-premium space-y-4 rounded-2xl p-6">
          <div className="skeleton-shimmer h-6 w-48 rounded" />
          <div className="skeleton-shimmer h-28 rounded-xl" />
          <div className="skeleton-shimmer h-20 rounded-xl" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-8">
        <h2 className="font-display mb-4 text-2xl font-semibold text-deep-brown">
          Résultats du classement
        </h2>
        <AnalysisErrorState />
      </section>
    );
  }

  if (!hasSearched) {
    return (
      <section className="mt-8">
        <h2 className="font-display mb-4 text-2xl font-semibold text-deep-brown">
          Résultats du classement
        </h2>
        <EmptyResultsState />
      </section>
    );
  }

  if (results.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="font-display mb-4 text-2xl font-semibold text-deep-brown">
          Résultats du classement
        </h2>
        <NoMatchState />
      </section>
    );
  }

  const [topCandidate, ...otherCandidates] = results;

  return (
    <section className="mt-8">
      <ResultsHeader count={results.length} />

      <div className="space-y-4">
        <div className="animate-fade-in-up">
          <TopCandidateCard result={topCandidate} />
        </div>

        {otherCandidates.length > 0 && (
          <div className="space-y-3">
            <h3 className="label-caps">Autres candidats</h3>
            {otherCandidates.map((result, index) => (
              <CandidateRow
                key={`${result.rank}-${result.filename}`}
                result={result}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
