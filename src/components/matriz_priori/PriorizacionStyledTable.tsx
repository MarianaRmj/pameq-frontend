"use client";

import React, { useMemo, useState } from "react";

type Criterio = {
  id: number;
  dominio: "riesgo" | "costo" | "frecuencia";
  valor: 1 | 3 | 5;
  etiqueta: string;
};

export type PriorizacionRow = {
  estandarId: number;
  codigo: string;
  descripcion: string;
  fortalezas?: string[];
  oportunidades?: string[];
  riesgo: 1 | 3 | 5 | null;
  costo: 1 | 3 | 5 | null;
  frecuencia: 1 | 3 | 5 | null;
  total: number | null;
  confirmado?: boolean;
};

interface Props {
  rows: PriorizacionRow[];
  criterios: {
    riesgo: Criterio[];
    costo: Criterio[];
    frecuencia: Criterio[];
  };
  saving?: Record<number, boolean>; // estandarId -> guardando
  loading?: boolean;
  readOnly?: boolean;
  onChange: (
    estandarId: number,
    field: "riesgo" | "costo" | "frecuencia",
    value: 1 | 3 | 5
  ) => void;
  onConfirm?: (estandarId: number) => void; // opcional
}

export default function PriorizacionStyledTable({
  rows,
  criterios,
  saving = {},
  loading = false,
  readOnly = false,
  onChange,
  onConfirm,
}: Props) {
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const ta = a.total ?? -Infinity;
      const tb = b.total ?? -Infinity;
      return sortDir === "asc" ? ta - tb : tb - ta;
    });
    return copy;
  }, [rows, sortDir]);

  const renderSelect = (
    estandarId: number,
    dominio: "riesgo" | "costo" | "frecuencia",
    val: number | null,
    disabled?: boolean
  ) => (
    <select
      className="w-full min-w-[220px] border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#2C5959] bg-white"
      aria-label={`${dominio} del estándar ${estandarId}`}
      title={val ? `${dominio}: ${val}` : `Selecciona ${dominio}`}
      value={val ?? ""}
      disabled={!!disabled}
      onChange={(e) =>
        onChange(estandarId, dominio, Number(e.target.value) as 1 | 3 | 5)
      }
    >
      <option value="" disabled>
        Selecciona…
      </option>
      {criterios[dominio]?.map((opt) => (
        <option key={opt.id} value={opt.valor} title={opt.etiqueta}>
          {opt.etiqueta}
        </option>
      ))}
    </select>
  );

  const headerCell =
    "px-4 py-3 text-left border-l border-white/20 first:border-l-0";

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-[#2C5959]">
          Matriz de Priorización
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 hidden sm:inline">
            Ordenar por Total
          </span>
          <button
            type="button"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="px-3 py-1 rounded text-sm font-medium transition bg-[#2C5959] text-white hover:bg-[#246d6d]"
            aria-label={`Cambiar orden: ${
              sortDir === "asc" ? "ascendente" : "descendente"
            }`}
            title={`Orden actual: ${
              sortDir === "asc" ? "Ascendente" : "Descendente"
            }`}
          >
            {sortDir === "asc" ? "Asc ↑" : "Desc ↓"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg shadow-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Encabezados agrupados */}
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#2C5959] text-white text-sm uppercase tracking-wide">
                <th className="px-4 py-3 text-left" rowSpan={2}>
                  Estándar a evaluar
                </th>
                <th className={headerCell} colSpan={2}>
                  Autoevaluación Cualitativa
                </th>
                <th className={headerCell} colSpan={onConfirm ? 5 : 4}>
                  Priorización
                </th>
              </tr>
              <tr className="bg-[#2C5959] text-white text-xs uppercase tracking-wide">
                <th className="px-4 py-2 text-left border-t border-white/20">
                  Fortalezas
                </th>
                <th className="px-4 py-2 text-left border-t border-white/20">
                  Oportunidades de mejora
                </th>
                <th className="px-4 py-2 text-left border-t border-white/20">
                  Riesgo
                </th>
                <th className="px-4 py-2 text-left border-t border-white/20">
                  Costo
                </th>
                <th className="px-4 py-2 text-left border-t border-white/20">
                  Frecuencia
                </th>
                <th className="px-4 py-2 text-left border-t border-white/20">
                  Total
                </th>
                {onConfirm && (
                  <th className="px-4 py-2 text-center border-t border-white/20">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {/* Estado cargando */}
              {loading && (
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="animate-pulse">
                      <td className="px-4 py-3">
                        <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-64 bg-gray-100 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-10 bg-gray-100 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-10 bg-gray-100 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-9 bg-gray-100 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-9 bg-gray-100 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-9 bg-gray-100 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-10 bg-gray-200 rounded" />
                      </td>
                      {onConfirm && <td className="px-4 py-3" />}
                    </tr>
                  ))}
                </>
              )}

              {/* Estado vacío */}
              {!loading && sortedRows.length === 0 && (
                <tr>
                  <td
                    colSpan={onConfirm ? 8 : 7}
                    className="text-center py-8 text-gray-500"
                  >
                    No hay estándares seleccionados para este proceso
                  </td>
                </tr>
              )}

              {/* Filas */}
              {!loading &&
                sortedRows.map((r, idx) => {
                  const disabled = readOnly || !!r.confirmado;
                  return (
                    <tr
                      key={r.estandarId}
                      className={`transition-colors hover:bg-gray-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      {/* Estándar */}
                      <td className="px-4 py-3 align-top min-w-[280px]">
                        <div className="font-semibold text-[#2C5959]">
                          {r.codigo}
                        </div>
                        <div className="text-sm text-gray-700">
                          {r.descripcion}
                        </div>
                      </td>

                      {/* Fortalezas */}
                      <td className="px-4 py-3 align-top w-[320px]">
                        {r.fortalezas?.length ? (
                          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                            {r.fortalezas.map((f, i) => (
                              <li key={i} className="line-clamp-3" title={f}>
                                {f}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>

                      {/* Oportunidades */}
                      <td className="px-4 py-3 align-top w-[320px]">
                        {r.oportunidades?.length ? (
                          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                            {r.oportunidades.map((o, i) => (
                              <li key={i} className="line-clamp-3" title={o}>
                                {o}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>

                      {/* Riesgo */}
                      <td className="px-4 py-3">
                        {renderSelect(
                          r.estandarId,
                          "riesgo",
                          r.riesgo,
                          disabled
                        )}
                      </td>

                      {/* Costo */}
                      <td className="px-4 py-3">
                        {renderSelect(r.estandarId, "costo", r.costo, disabled)}
                      </td>

                      {/* Frecuencia */}
                      <td className="px-4 py-3">
                        {renderSelect(
                          r.estandarId,
                          "frecuencia",
                          r.frecuencia,
                          disabled
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 align-top">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-semibold text-[#2C5959]">
                            {r.total ?? "—"}
                          </span>
                          {saving[r.estandarId] && (
                            <span className="text-xs text-gray-500">
                              guardando…
                            </span>
                          )}
                          {r.confirmado && (
                            <span className="ml-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                              Confirmado
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Acciones */}
                      {onConfirm && (
                        <td className="px-4 py-3 text-center align-top">
                          <button
                            type="button"
                            onClick={() => onConfirm(r.estandarId)}
                            disabled={!!r.confirmado}
                            className={`px-3 py-1 rounded text-sm font-medium transition ${
                              r.confirmado
                                ? "bg-green-600 text-white cursor-default"
                                : "bg-[#2C5959] text-white hover:bg-[#246d6d]"
                            }`}
                            title={
                              r.confirmado
                                ? "Ya confirmado"
                                : "Confirmar priorización"
                            }
                          >
                            {r.confirmado ? "Confirmado ✅" : "Confirmar"}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
