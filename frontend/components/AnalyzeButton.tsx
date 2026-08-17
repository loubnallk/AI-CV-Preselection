interface AnalyzeButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

function LoadingSpinner() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 animate-spin-slow text-white"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function AnalyzeButton({
  onClick,
  disabled = false,
  loading = false,
}: AnalyzeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:w-auto"
    >
      {loading ? (
        <>
          <LoadingSpinner />
          Analyse en cours...
        </>
      ) : (
        <>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" strokeLinecap="round" />
          </svg>
          Lancer l&apos;analyse
        </>
      )}
    </button>
  );
}
