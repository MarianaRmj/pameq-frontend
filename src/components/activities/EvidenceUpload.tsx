// app/dashboard/activities/EvidenceUpload.tsx
'use client';
import { useState } from 'react';
import { API_URL } from '@/app/lib/api';

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
    setLoading(true); setErr(null);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      const r = await fetch(`${API_URL}/activities/${activityId}/evidences`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      await onUploaded();
      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message || 'Error subiendo evidencias');
      } else {
        setErr('Error subiendo evidencias');
      }
    } finally {
      setLoading(false);
    }
  }

  const selected = files ? Array.from(files) : [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={submit}
        className="ui-card w-full max-w-lg space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#2A5559]">Adjuntar evidencias</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <label className="ui-label">Archivos</label>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="ui-input file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
          />

          {/* Lista compacta de archivos seleccionados */}
          {selected.length > 0 && (
            <div className="mt-2 max-h-32 overflow-auto rounded-lg border border-gray-200 bg-white/60">
              <ul className="divide-y">
                {selected.map((f, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="truncate">{f.name}</span>
                    <span className="text-xs text-gray-500">{prettyBytes(f.size)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {err && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="ui-btn">
            Cancelar
          </button>
          <button disabled={loading || selected.length === 0} className="ui-btn ui-btn-primary">
            {loading ? 'Subiendo…' : 'Subir'}
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
