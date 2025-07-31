"use client";

import React from "react";
import { CicloForm } from "./types";

interface Props {
  ciclosPaginados: CicloForm[];
  sedes: { id: number; nombre_sede: string }[];
  updateCiclo: <K extends keyof CicloForm>(
    index: number,
    field: K,
    value: CicloForm[K]
  ) => void;
  saveCiclo: (index: number) => void;
  eliminarCiclo: (index: number) => void;
  addCiclo: () => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const CicloRow = ({
  ciclo,
  index,
  sedes,
  updateCiclo,
  saveCiclo,
  eliminarCiclo,
}: {
  ciclo: CicloForm;
  index: number;
  sedes: { id: number; nombre_sede: string }[];
  updateCiclo: Props["updateCiclo"];
  saveCiclo: Props["saveCiclo"];
  eliminarCiclo: Props["eliminarCiclo"];
}) => {
  const estados: CicloForm["estado"][] = ["activo", "en_proceso", "finalizado"];

  const estadoEstilo = {
    activo: "bg-green-100 text-green-700 border border-green-300",
    en_proceso: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    finalizado: "bg-red-100 text-red-700 border-red-300",
  };

  return (
    <tr className="hover:bg-blancoConVerde transition">
      {(["fecha_inicio", "fecha_fin", "enfoque"] as const).map((campo) => (
        <td key={campo} className="p-2">
          <input
            type={campo === "enfoque" ? "text" : "date"}
            value={ciclo[campo] || ""}
            onChange={(e) => updateCiclo(index, campo, e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-verdeClaro"
          />
        </td>
      ))}

      <td className="p-2">
        <select
          value={ciclo.sedeId || ciclo.sede?.id || ""}
          onChange={(e) => updateCiclo(index, "sedeId", Number(e.target.value))}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="">Seleccione sede</option>
          {sedes.map((sede) => (
            <option key={sede.id} value={sede.id}>
              {sede.nombre_sede}
            </option>
          ))}
        </select>
      </td>

      <td className="p-2">
        <select
          value={ciclo.estado}
          onChange={(e) =>
            updateCiclo(index, "estado", e.target.value as CicloForm["estado"])
          }
          className={`w-full px-2 py-1 text-sm rounded font-nunito text-center ${
            estadoEstilo[ciclo.estado]
          }`}
        >
          {estados.map((estado) => (
            <option key={estado} value={estado}>
              {estado[0].toUpperCase() + estado.slice(1).replace("_", " ")}
            </option>
          ))}
        </select>
      </td>

      <td className="p-2">
        <textarea
          value={ciclo.observaciones}
          onChange={(e) => updateCiclo(index, "observaciones", e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-y max-h-[100px] overflow-auto"
        />
      </td>

      <td className="p-1 text-center whitespace-nowrap">
        <button
          type="button"
          onClick={() => saveCiclo(index)}
          className="text-verdeClaro text-lg hover:text-verdeOscuro transition"
          title="Guardar"
        >
          💾
        </button>
        <button
          type="button"
          onClick={() => eliminarCiclo(index)}
          className="text-red-500 text-lg ml-1 hover:text-red-700 transition"
          title="Eliminar ciclo"
        >
          🗑️
        </button>
      </td>
    </tr>
  );
};

export const CiclosTable = ({
  ciclosPaginados,
  sedes,
  updateCiclo,
  saveCiclo,
  eliminarCiclo,
  addCiclo,
  currentPage,
  totalPages,
  setCurrentPage,
}: Props) => {
  return (
    <div className="md:col-span-2 mt-3">
      <h3 className="text-xl font-nunito text-verdeOscuro mb-2">Ciclos</h3>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-verdeOscuro text-white">
            <tr>
              {[
                "Inicio",
                "Fin",
                "Enfoque",
                "Sede",
                "Estado",
                "Observaciones",
                "Acciones",
              ].map((h) => (
                <th key={h} className="p-3 text-left font-nunito">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {ciclosPaginados.map((ciclo, indexOnPage) => {
              const globalIndex = (currentPage - 1) * 5 + indexOnPage;
              return (
                <CicloRow
                  key={globalIndex}
                  index={globalIndex}
                  ciclo={ciclo}
                  sedes={sedes}
                  updateCiclo={updateCiclo}
                  saveCiclo={saveCiclo}
                  eliminarCiclo={eliminarCiclo}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Botón para agregar nuevo ciclo */}
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={addCiclo}
          className="bg-verdeOscuro text-white px-3 py-1 rounded hover:bg-verdeClaro transition"
        >
          ➕ Agregar Ciclo
        </button>
      </div>

      {/* Paginación */}
      <div className="flex justify-center items-center gap-1 mt-2">
        <button
          type="button"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2 rounded border bg-gray-100 hover:bg-gray-100 disabled:opacity-50"
        >
          Anterior
        </button>

        {Array.from({ length: totalPages }, (_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`px-2 rounded border ${
                currentPage === page
                  ? "bg-verdeOscuro text-white"
                  : "bg-white hover:bg-verdeClaro"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
