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

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{label}</span>
          <span className="font-medium text-slate-700">{formatScore(score)}</span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${
              highlight ? "bg-emerald-500" : "bg-blue-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {!label && (
          <span
            className={`min-w-14 text-right text-sm font-semibold ${
              highlight ? "text-emerald-700" : "text-slate-800"
            }`}
          >
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
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
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

function ScoreDetails({ result, highlight = false }: { result: AnalyzeResult; highlight?: boolean }) {
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
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs text-slate-500">Score sémantique</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {formatScore(breakdown.semantic)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs text-slate-500">Score compétences</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {breakdown.keywords !== null ? formatScore(breakdown.keywords) : "N/A"}
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-500">
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
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Extrait le plus pertinent
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-700">&ldquo;{excerpt}&rdquo;</p>
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
            <p className="text-sm text-slate-500">
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
    <article className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm ring-1 ring-emerald-100">
      <div className="space-y-4">
        <div>
          <span className="inline-flex rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Meilleur candidat
          </span>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Rang #{result.rank}
          </p>
          <h3 className="mt-1 break-all text-lg font-bold text-slate-900">
            {result.filename}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
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
    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
      <p className="font-semibold">Analyse interrompue</p>
      <p className="mt-1">
        Le classement n&apos;a pas pu être généré. Consultez le message
        d&apos;erreur dans le formulaire pour corriger le problème, puis
        relancez l&apos;analyse.
      </p>
    </div>
  );
}

function CandidateRow({ result }: { result: AnalyzeResult }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
            #{result.rank}
          </span>
          <div className="min-w-0 flex-1">
            <p className="break-all font-medium text-slate-900">{result.filename}</p>
            <p className="text-xs text-slate-500">Candidat classé</p>
          </div>
        </div>

        <CandidateDetails result={result} />
      </div>
    </article>
  );
}

function EmptyResultsState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-7 w-7 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M4 19h16M6 16l3-8 3 4 3-6 3 10" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-800">
        Aucun résultat pour le moment
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Renseignez une offre, importez des CV PDF, puis lancez l&apos;analyse
        pour afficher le classement ici.
      </p>
    </div>
  );
}

function NoMatchState() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
      L&apos;analyse s&apos;est terminée, mais aucun candidat n&apos;a pu être
      classé.
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
        <div className="animate-pulse space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="h-28 rounded-xl bg-slate-100" />
          <div className="h-20 rounded-xl bg-slate-100" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Résultats du classement
        </h2>
        <AnalysisErrorState />
      </section>
    );
  }

  if (!hasSearched) {
    return (
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Résultats du classement
        </h2>
        <EmptyResultsState />
      </section>
    );
  }

  if (results.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Résultats du classement
        </h2>
        <NoMatchState />
      </section>
    );
  }

  const [topCandidate, ...otherCandidates] = results;

  return (
    <section className="mt-8">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Résultats du classement
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {results.length} candidat{results.length > 1 ? "s" : ""} analysé
            {results.length > 1 ? "s" : ""}, trié
            {results.length > 1 ? "s" : ""} par pertinence décroissante.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <TopCandidateCard result={topCandidate} />

        {otherCandidates.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Autres candidats
            </h3>
            {otherCandidates.map((result) => (
              <CandidateRow
                key={`${result.rank}-${result.filename}`}
                result={result}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
