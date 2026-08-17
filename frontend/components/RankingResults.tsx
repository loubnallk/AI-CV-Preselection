import type { AnalyzeResult } from "@/lib/api";

interface RankingResultsProps {
  results: AnalyzeResult[];
  hasSearched: boolean;
  loading: boolean;
}

function formatScore(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

function ScoreBar({ score, highlight = false }: { score: number; highlight?: boolean }) {
  const percentage = Math.max(0, Math.min(score * 100, 100));

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${
            highlight ? "bg-emerald-500" : "bg-blue-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={`min-w-14 text-right text-sm font-semibold ${
          highlight ? "text-emerald-700" : "text-slate-800"
        }`}
      >
        {formatScore(score)}
      </span>
    </div>
  );
}

function TopCandidateCard({ result }: { result: AnalyzeResult }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm ring-1 ring-emerald-100">
      <div className="absolute right-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
        Meilleur candidat
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Rang #{result.rank}
          </p>
          <h3 className="mt-1 break-all text-lg font-bold text-slate-900">
            {result.filename}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Correspondance la plus élevée avec l&apos;offre d&apos;emploi.
          </p>
        </div>
        <div className="w-full sm:max-w-xs">
          <ScoreBar score={result.score} highlight />
        </div>
      </div>
    </article>
  );
}

function CandidateRow({ result }: { result: AnalyzeResult }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
            #{result.rank}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">
              {result.filename}
            </p>
            <p className="text-xs text-slate-500">Candidat classé</p>
          </div>
        </div>
        <div className="w-full sm:max-w-xs">
          <ScoreBar score={result.score} />
        </div>
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
              <CandidateRow key={`${result.rank}-${result.filename}`} result={result} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
