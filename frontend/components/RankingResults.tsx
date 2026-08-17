import type { AnalyzeResult } from "@/lib/api";

interface RankingResultsProps {
  results: AnalyzeResult[];
}

function formatScore(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

export default function RankingResults({ results }: RankingResultsProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900">
        Classement des candidats
      </h2>
      <div className="overflow-hidden rounded-lg border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-700">
                Rang
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-700">
                Fichier
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-700">
                Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {results.map((result) => (
              <tr key={`${result.rank}-${result.filename}`}>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {result.rank}
                </td>
                <td className="px-4 py-3 text-zinc-700">{result.filename}</td>
                <td className="px-4 py-3 text-zinc-900">
                  {formatScore(result.score)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
