"use client";
import type { Activity } from "@/app/dashboard/activities/types";

export function ActivitiesTable({
  items,
  onEdit,
  onDelete,
  onOpenUpload,
}: {
  items: Activity[];
  onEdit: (a: Activity) => void;
  onDelete: (a: Activity) => void;
  onOpenUpload: (a: Activity) => void;
  onOpenList: (a: Activity) => void;
}) {
  return (
    <div className="ui-card overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full table-auto border-collapse">
        {/* Head */}
        <thead className="bg-verdeOscuro text-white">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-nunito uppercase tracking-wide">
              Actividad
            </th>
            <th className="px-4 py-3 text-left text-xs font-nunito uppercase tracking-wide">
              Fechas
            </th>
            <th className="px-4 py-3 text-left text-xs font-nunito uppercase tracking-wide">
              Responsable
            </th>
            <th className="px-4 py-3 text-left text-xs font-nunito uppercase tracking-wide">
              Procesos
            </th>
            <th className="px-4 py-3 text-center text-xs font-nunito uppercase tracking-wide">
              Evidencias
            </th>
            <th className="px-4 py-3 text-center text-xs font-nunito uppercase tracking-wide">
              Estado
            </th>
            <th className="px-4 py-3 text-right text-xs font-nunito uppercase tracking-wide">
              Acciones
            </th>
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-gray-100 text-sm">
          {items.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50">
              {/* Actividad */}
              <td className="px-4 py-3">
                <div className="font-medium text-gray-800">
                  {a.nombre_actividad}
                </div>
                <div className="text-xs text-gray-500">{a.lugar || "—"}</div>
              </td>

              {/* Fechas */}
              <td className="px-4 py-3 text-xs text-gray-600">
                <div>{fmtDateTime(a.fecha_inicio)}</div>
                <div className="text-gray-400">{fmtDateTime(a.fecha_fin)}</div>
              </td>

              {/* Responsable */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 flex items-center justify-center rounded-full bg-verdeClaro text-white text-xs font-bold">
                    {a.responsable?.nombre?.[0] ?? "?"}
                  </div>
                  <span className="text-sm text-gray-700">
                    {a.responsable?.nombre ?? "—"}
                  </span>
                </div>
              </td>

              {/* Procesos */}
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {a.procesos?.map((p) => (
                    <span
                      key={p.id}
                      className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700"
                    >
                      {p.nombre_proceso}
                    </span>
                  )) || <span className="text-gray-400">—</span>}
                </div>
              </td>

              {/* Evidencias */}
              <td className="px-4 py-3 text-center">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-700">
                  {a.evidencias?.length ?? 0}
                </span>
              </td>

              {/* Estado */}
              <td className="px-4 py-3 text-center">
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-medium ${
                    a.estado === "programada"
                      ? "bg-emerald-50 text-emerald-700"
                      : a.estado === "en_proceso"
                      ? "bg-yellow-50 text-yellow-700"
                      : a.estado === "finalizada"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {a.estado}
                </span>
              </td>

              {/* Acciones */}
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2 text-gray-500 text-sm">
                  <button
                    onClick={() => onEdit(a)}
                    title="Editar"
                    className="hover:text-verdeOscuro"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(a)}
                    title="Eliminar"
                    className="hover:text-rose-600"
                  >
                    🗑️
                  </button>
                  <button
                    onClick={() => onOpenUpload(a)}
                    title="Subir evidencias"
                    className="hover:text-verdeOscuro"
                  >
                    📂
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
