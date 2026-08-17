"use client";

import { useRef, useState } from "react";

interface CvUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

function isPdfFile(file: File): boolean {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

function mergePdfFiles(existing: File[], incoming: File[]): File[] {
  const map = new Map<string, File>();
  [...existing, ...incoming.filter(isPdfFile)].forEach((file) => {
    map.set(`${file.name}-${file.size}`, file);
  });
  return Array.from(map.values());
}

export default function CvUpload({
  files,
  onChange,
  disabled = false,
}: CvUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(selectedFiles: File[]) {
    onChange(mergePdfFiles(files, selectedFiles));
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) {
      return;
    }
    handleFiles(Array.from(event.dataTransfer.files));
  }

  function removeFile(target: File) {
    onChange(
      files.filter(
        (file) =>
          `${file.name}-${file.size}` !== `${target.name}-${target.size}`,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            2. CVs des candidats
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Importez un ou plusieurs fichiers PDF. Glissez-déposez ou
            parcourez vos fichiers.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          {files.length === 0
            ? "Aucun CV"
            : `${files.length} CV${files.length > 1 ? "s" : ""} sélectionné${files.length > 1 ? "s" : ""}`}
        </span>
      </div>

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
            : isDragging
              ? "border-blue-500 bg-blue-50/70"
              : "border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/40"
        }`}
      >
        <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 16V4m0 0 8-4m-4 4h8" strokeLinecap="round" />
              <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">
              Déposez vos CV PDF ici
            </p>
            <p className="mt-1 text-xs text-slate-500">
              ou utilisez le bouton ci-dessous
            </p>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed"
          >
            Parcourir les fichiers
          </button>
        </div>

        <input
          ref={inputRef}
          id="cv-upload"
          type="file"
          accept=".pdf,application/pdf"
          multiple
          disabled={disabled}
          className="hidden"
          onChange={(event) => {
            handleFiles(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {files.map((file) => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-xs font-bold text-red-600">
                  PDF
                </span>
                <span className="truncate font-medium text-slate-800">
                  {file.name}
                </span>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeFile(file)}
                  className="shrink-0 text-xs font-medium text-slate-500 transition hover:text-red-600"
                >
                  Retirer
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
