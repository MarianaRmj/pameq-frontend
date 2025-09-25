// app/dashboard/activities/components/EvidenceListModal.tsx
"use client";
import { useEffect, useState } from "react";
import type { Activity, Evidence } from "@/app/dashboard/activities/types";
import { API_URL } from "@/app/lib/api";

export function EvidenceListModal({
  activityId,
  onClose,
  onChanged,
}: {
  activityId: number;
  onClose: () => void;
  onChanged?: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [rows, setRows] = useState<Evidence[]>([]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${API_URL}/activities/${activityId}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      const a = (await r.json()) as Activity;
      setRows(a.evidencias || []);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error cargando evidencias");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  async function handleDelete(ev: Evidence) {
    if (!confirm(`Eliminar "${ev.originalName}"?`)) return;
    const r = await fetch(
      `${API_URL}/activities/${activityId}/evidences/${ev.id}`,
      {
        method: "DELETE",
        credentials: "include",
        body: new FormData(), // <— se mantiene igual
      }
    );
    if (!r.ok) return alert("No se pudo eliminar");
    await load();
    await onChanged?.();
  }

  // 👉 Solo-UI: skeleton rows (no afecta lógica)
  const skeleton = Array.from({ length: 6 });

  return (
    <div className="fixed inset-0 z-[65] grid place-items-center bg-black/40 backdrop-blur-sm p-4 sm:p-6">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b px-5 py-3 bg-white/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-nunito text-[#2A5559]">
              Evidencias — Actividad #{activityId}
            </h3>
            {!loading && (
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] text-gray-700">
                {rows.length} archivo{rows.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
            aria-label="Cerrar"
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {loading ? (
            // Skeleton loader minimalista (solo visual)
            <div className="max-h-[60vh] overflow-hidden rounded-xl border border-gray-200">
              <div className="sticky top-0 z-10 bg-gray-100/80 px-4 py-3">
                <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
              </div>
              <ul className="divide-y divide-gray-100">
                {skeleton.map((_, i) => (
                  <li key={i} className="grid grid-cols-12 gap-4 px-4 py-3">
                    <div className="col-span-6 space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                    </div>
                    <div className="col-span-2">
                      <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
                    </div>
                    <div className="col-span-2">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : err ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 px-6 py-10 text-center">
              <div className="mb-2 text-2xl">📄</div>
              <p className="text-sm text-gray-600">
                Sin evidencias para esta actividad.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Usa 📂 en la tabla principal para cargar archivos.
              </p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="sticky top-0 z-10 bg-verdeOscuro text-[11px] uppercase tracking-wide text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-nunito">Archivo</th>
                    <th className="px-4 py-3 text-left font-nunito">Tipo</th>
                    <th className="px-4 py-3 text-left font-nunito">Tamaño</th>
                    <th className="px-4 py-3 text-left font-nunito">Fecha</th>
                    <th className="px-4 py-3 text-right font-nunito">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="align-middle">
                  {rows.map((ev) => (
                    <tr
                      key={ev.id}
                      className="odd:bg-white even:bg-gray-50/70 hover:bg-emerald-50/40"
                    >
                      <td className="px-4 py-3">
                        <div
                          className="max-w-[420px] truncate font-medium text-[#102626]"
                          title={ev.originalName}
                        >
                          {ev.originalName || ev.filename}
                        </div>
                        <div className="mt-0.5 text-[11px] text-gray-500">
                          {ev.filename}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">
                          {ev.mimeType}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-800">
                        {prettyBytes(ev.size)}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {formatDate(ev.uploaded_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md px-2 py-1 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            title="Ver evidencia"
                          >
                            👁️
                          </a>
                          <button
                            onClick={() => handleDelete(ev)}
                            className="rounded-md px-2 py-1 text-rose-700 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300"
                            title="Eliminar evidencia"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function prettyBytes(n?: number) {
  if (n == null) return "-";
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(1)} GB`;
}
function formatDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
}
