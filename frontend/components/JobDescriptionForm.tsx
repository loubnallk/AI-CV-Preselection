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
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="job-description" className="text-sm font-medium text-zinc-800">
        Description de l&apos;offre
      </label>
      <textarea
        id="job-description"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={6}
        placeholder="Ex. : Développeur Python FastAPI, 3 ans d'expérience, maîtrise des APIs REST..."
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-zinc-100"
      />
    </div>
  );
}
