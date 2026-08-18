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
      className="h-5 w-5 animate-spin-slow text-champagne-gold"
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
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-muted-gold/50 bg-black px-6 py-3.5 text-base font-semibold text-cream shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-0.5 hover:border-champagne-gold hover:shadow-[0_8px_24px_rgba(198,161,91,0.25)] focus:outline-none focus:ring-2 focus:ring-champagne-gold/40 disabled:cursor-not-allowed disabled:border-transparent disabled:bg-champagne-beige/60 disabled:text-chocolate/60 disabled:shadow-none disabled:hover:translate-y-0 sm:w-auto"
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
            className="h-5 w-5 text-champagne-gold"
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
