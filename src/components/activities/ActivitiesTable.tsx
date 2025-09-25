"use client";
import { useEffect, useMemo, useState } from "react";
import type { Activity } from "@/app/dashboard/activities/types";

export function ActivitiesTable({
  items,
  onEdit,
  onDelete,
  onOpenUpload,
  onOpenList, // ✅ Agregado aquí
}: {
  items: Activity[];
  onEdit: (a: Activity) => void;
  onDelete: (a: Activity) => void;
  onOpenUpload: (a: Activity) => void;
  onOpenList: (a: Activity) => void;
}) {
  // --- Paginación (nuevo, sin alterar tu lógica) ---
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex]
  );

  const goFirst = () => setCurrentPage(1);
  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setCurrentPage(totalPages);

  function makePageList(total: number, current: number): (number | string)[] {
    const out: (number | string)[] = [];
    const delta = 1;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);

    if (start > 1) out.push(1);
    if (start > 2) out.push("…");
    for (let i = start; i <= end; i++) out.push(i);
    if (end < total - 1) out.push("…");
    if (end < total) out.push(total);
    return out;
  }

  const pages = makePageList(totalPages, currentPage);

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
          {paginatedItems.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                No hay actividades para mostrar.
              </td>
            </tr>
          ) : (
            paginatedItems.map((a) => (
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
                  <div className="text-gray-400">
                    {fmtDateTime(a.fecha_fin)}
                  </div>
                </td>

                {/* Responsable */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-nunito text-center text-gray-800">
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

                {/* Evidencias: contador + ojito */}
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-2 group">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700">
                      {a.evidencias?.length ?? 0}
                    </span>
                    <button
                      onClick={() => onOpenList(a)} // ✅ ahora sí existe
                      title="Ver evidencias"
                      aria-label="Ver evidencias"
                      className=" group-hover:opacity-100 transition-opacity rounded-md px-2 py-1 hover:bg-emerald-50  focus:ring-2 focus:ring-emerald-300"
                    >
                      👁️
                    </button>
                  </div>
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
            ))
          )}
        </tbody>
      </table>

      {/* Footer de paginación */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between px-4 py-3 border-t bg-white">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>
            Mostrando{" "}
            <span className="font-medium">
              {totalItems === 0 ? 0 : startIndex + 1}
            </span>
            –<span className="font-medium">{endIndex}</span> de{" "}
            <span className="font-medium">{totalItems}</span>
          </span>
          <label className="inline-flex items-center gap-2">
            <span className="text-gray-500">Filas por página</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border-gray-300 text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-verdeClaro"
            >
              {[5, 10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={goFirst}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-md border text-sm disabled:opacity-40 hover:bg-gray-50"
            aria-label="Primera página"
            title="Primera página"
          >
            «
          </button>
          <button
            onClick={goPrev}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-md border text-sm disabled:opacity-40 hover:bg-gray-50"
            aria-label="Página anterior"
            title="Página anterior"
          >
            ◀
          </button>

          {pages.map((p, i) =>
            typeof p === "number" ? (
              <button
                key={`${p}-${i}`}
                onClick={() => setCurrentPage(p)}
                className={`min-w-[36px] px-3 py-1 rounded-md border text-sm ${
                  p === currentPage
                    ? "bg-verdeOscuro text-white border-verdeOscuro"
                    : "hover:bg-gray-50"
                }`}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </button>
            ) : (
              <span
                key={`dots-${i}`}
                className="px-2 text-gray-400 select-none"
              >
                …
              </span>
            )
          )}

          <button
            onClick={goNext}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-md border text-sm disabled:opacity-40 hover:bg-gray-50"
            aria-label="Página siguiente"
            title="Página siguiente"
          >
            ▶
          </button>
          <button
            onClick={goLast}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded-md border text-sm disabled:opacity-40 hover:bg-gray-50"
            aria-label="Última página"
            title="Última página"
          >
            »
          </button>
        </div>
      </div>
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
