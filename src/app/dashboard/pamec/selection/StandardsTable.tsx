"use client";

import { useState } from "react";
import { EstandarConOportunidad } from "./type";

interface StandardsTableProps {
  estandares: EstandarConOportunidad[];
  selecciones: Record<number, { seleccion: boolean; observaciones: string }>;
}

export default function StandardsTable({ estandares }: StandardsTableProps) {
  const rowsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({}); // 👈 controlar expandidos

  const rows = estandares.flatMap((e) =>
    (e.oportunidades ?? []).map((o) => ({
      id: `${e.id}-${o.id}`,
      codigo: e.codigo,
      descripcion: e.descripcion,
      oportunidad: o.descripcion,
      procesos: o.procesos.map((p) => p.nombre).join(", "),
    }))
  );

  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = rows.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-6 text-[#2C5959] border-b pb-2">
        Estándares con Oportunidades de Mejora
      </h2>

      <div className="overflow-hidden rounded-lg shadow-lg border border-gray-200">
        <table className="w-full border-collapse">
          <thead className="bg-[#2C5959] text-white text-sm uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-center">Código</th>
              <th className="px-4 py-3 text-center">Estándar</th>
              <th className="px-4 py-3 text-center">Oportunidad</th>
              <th className="px-4 py-3 text-center">Proceso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {currentRows.map((row, idx) => (
              <tr
                key={row.id}
                className={`transition-colors hover:bg-gray-50 ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                <td className="px-4 py-3 font-semibold text-[#2C5959]">
                  {row.codigo}
                </td>

                {/* 📌 Descripción expandible */}
                <td className="px-4 py-3 max-w-xs">
                  <p
                    className={`text-gray-700 text-sm ${
                      expanded[row.id] ? "" : "line-clamp-2"
                    }`}
                  >
                    {row.descripcion}
                  </p>
                  <button
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [row.id]: !prev[row.id],
                      }))
                    }
                    className="text-xs text-[#2C5959] underline mt-1"
                  >
                    {expanded[row.id] ? "Ver menos" : "Ver más"}
                  </button>
                </td>

                {/* 📌 Oportunidad */}
                <td className="px-4 py-3 max-w-sm">
                  <p
                    className="line-clamp-2 text-gray-800"
                    title={row.oportunidad}
                  >
                    {row.oportunidad}
                  </p>
                </td>

                {/* 📌 Procesos con badges */}
                <td className="px-4 py-3 text-sm text-gray-600">
                  {row.procesos.split(", ").map((p) => (
                    <span
                      key={p}
                      className="inline-block bg-[#e4f7ec] text-[#2C5959] px-2 py-1 rounded-full text-xs font-medium mr-1 mb-1"
                    >
                      {p}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📌 Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
