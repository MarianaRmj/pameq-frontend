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
        body: new FormData()
      }
    );
    if (!r.ok) return alert("No se pudo eliminar");
    await load();
    await onChanged?.();
  }

  return (
    <div className="fixed inset-0 z-[65] grid place-items-center  bg-black/40 backdrop-blur-sm p-4 sm:p-6">
      <div className="ui-card w-full max-w-4xl rounded-2xl border border-gray-200 bg-white-700 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between  gap-4 border-b px-5 py-3">
          <h3 className="text-lg font-nunito text-[#000000]">
            Evidencias — Actividad #{activityId}
          </h3>
          <button
            onClick={onClose}
            className="ui-btn-ghost rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-700"
            aria-label="Cerrar"
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 ">
          {loading ? (
            <div className="text-sm text-gray-500">Cargando…</div>
          ) : err ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 px-6 py-10 text-center text-sm text-gray-500">
              Sin evidencias.
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-auto rounded-xl border  border-gray-200">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="sticky top-0 z-5 bg-verdeOscuro text-[11px] uppercase tracking-wide text-white text-center">
                  <tr>
                    <th className="px-4 py-3 text-left font-nunito">Archivo</th>
                    <th className="px-6 py-3 text-left font-nunito">Tipo</th>
                    <th className="px-4 py-3 text-left font-nunito">Tamaño</th>
                    <th className="px-9 py-2 text-left font-nunito">Fecha</th>
                    <th className="px-6 py-2 text-right font-nunito">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
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
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 ring-1 ring-gray-200">
                          {ev.mimeType}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {prettyBytes(ev.size)}
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(ev.uploaded_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ui-btn-ghost rounded-md px-2 py-1 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                            title="Ver evidencias"
                          >
                            👁️
                          </a>
                          <button
                            onClick={() => handleDelete(ev)}
                            className="ui-btn-ghost rounded-md px-2 py-1 text-rose-700 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300"
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
