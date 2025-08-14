// app/dashboard/activities/components/EvidenceUpload.tsx
"use client";
import { useState } from "react";
import { API_URL } from "@/app/lib/api";

export function EvidenceUpload({
  activityId,
  onUploaded,
  onClose,
}: {
  activityId: number;
  onUploaded: () => Promise<void>;
  onClose: () => void;
}) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!files || !files.length) return;
    setLoading(true);
    setErr(null);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const r = await fetch(`${API_URL}/activities/${activityId}/evidences`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      await onUploaded();
      onClose();
    } catch (e: unknown) {
      setErr(
        e instanceof Error
          ? e.message || "Error subiendo evidencias"
          : "Error subiendo evidencias"
      );
    } finally {
      setLoading(false);
    }
  }

  const selected = files ? Array.from(files) : [];

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 backdrop-blur-sm p-4 sm:p-6">
      <form
        onSubmit={submit}
        className="ui-card w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-lg font-semibold text-[#2A5559]">
            Adjuntar evidencias
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="ui-btn-ghost rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-4">
          <div className="space-y-2">
            <label htmlFor="evi-input" className="ui-label">
              Archivos
            </label>

            {/* drop-area visual (sin cambiar lógica) */}
            <div className="flex items-center gap-3">
              <input
                id="evi-input"
                type="file"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="sr-only"
              />
              <label
                htmlFor="evi-input"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-verdeOscuro px-4 py-2 font-nunito text-white shadow-sm
               hover:bg-verdeClaro hover:shadow-md
               focus:outline-none focus:ring-2 focus:ring-verdeClaro-300 focus:ring-offset-2"
              >
                {/* ícono clip */}
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12.79V9a5 5 0 00-10 0v8a3 3 0 006 0V9"
                  />
                </svg>
                Seleccionar archivos
              </label>

              {/* estado compacto opcional */}
              {selected.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selected.length} archivo{selected.length > 1 ? "s" : ""}{" "}
                  seleccionado{selected.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Lista de seleccionados */}
            {selected.length > 0 && (
              <div className="mt-2 max-h-36 overflow-auto rounded-lg border border-gray-200 bg-white">
                <ul className="divide-y divide-gray-100">
                  {selected.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 px-4 py-2 text-sm odd:bg-white even:bg-gray-50/60"
                    >
                      <span className="truncate">{f.name}</span>
                      <span className="text-xs text-gray-500 tabular-nums">
                        {prettyBytes(f.size)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {err && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
          <button type="button" onClick={onClose} className="ui-btn rounded-md">
            Cancelar
          </button>
          <button
            disabled={loading || selected.length === 0}
            className="ui-btn ui-btn-primary rounded-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Subiendo…" : "Subir"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---- util solo visual ---- */
function prettyBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(1)} GB`;
}
