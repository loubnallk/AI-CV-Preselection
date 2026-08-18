interface JobDescriptionFormProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function JobDescriptionForm({
  value,
  onChange,
  disabled = false,
}: JobDescriptionFormProps) {
  const characterCount = value.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-deep-brown">
            <span className="text-muted-gold">1.</span> Description de
            l&apos;offre
          </h2>
          <p className="mt-1 text-sm leading-6 text-chocolate">
            Collez le texte complet ou un résumé du poste à pourvoir.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--border)] bg-champagne-beige/40 px-2.5 py-1 text-xs font-medium text-chocolate">
          {characterCount} car.
        </span>
      </div>

      <div className="relative">
        <textarea
          id="job-description"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          rows={7}
          placeholder="Ex. : Développeur Python FastAPI, 3 ans d'expérience, maîtrise des APIs REST, bonnes pratiques backend..."
          className="w-full resize-y rounded-xl border border-[var(--border)] bg-cream/60 px-4 py-3 text-sm leading-6 text-deep-brown shadow-inner outline-none transition placeholder:text-chocolate/45 focus:border-muted-gold focus:bg-card focus:ring-2 focus:ring-champagne-gold/30 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </div>
  );
}
