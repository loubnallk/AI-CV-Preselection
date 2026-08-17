interface CvUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

export default function CvUpload({
  files,
  onChange,
  disabled = false,
}: CvUploadProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="cv-upload" className="text-sm font-medium text-zinc-800">
        CVs (PDF)
      </label>
      <input
        id="cv-upload"
        type="file"
        accept=".pdf,application/pdf"
        multiple
        disabled={disabled}
        onChange={(event) => {
          const selectedFiles = Array.from(event.target.files ?? []);
          onChange(selectedFiles);
        }}
        className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 disabled:cursor-not-allowed disabled:bg-zinc-100"
      />
      {files.length > 0 && (
        <ul className="mt-1 space-y-1 text-sm text-zinc-600">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
