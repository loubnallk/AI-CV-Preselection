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
          <h2 className="text-base font-semibold text-slate-900">
            1. Description de l&apos;offre
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Collez le texte complet ou un résumé du poste à pourvoir.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
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
          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm leading-6 text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </div>
  );
}
