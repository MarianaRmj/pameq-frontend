import { RecuentoProceso } from "./type";

interface ProcessesTableProps {
  data: RecuentoProceso[];
  selecciones: Record<number, { seleccion: boolean; observaciones: string }>;
  guardados: Record<number, boolean>;
  onChange: (
    procesoId: number,
    field: "seleccion" | "observaciones",
    value: boolean | string
  ) => void;
  onSave: (row: RecuentoProceso) => void;
}

export default function ProcessesTable({
  data,
  selecciones,
  guardados,
  onChange,
  onSave,
}: ProcessesTableProps) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-6 text-[#2C5959] border-b pb-2">
        Selección de Procesos
      </h2>

      <div className="overflow-hidden rounded-lg shadow-lg border border-gray-200">
        <table className="w-full border-collapse">
          <thead className="bg-[#2C5959] text-white text-sm uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Proceso</th>
              <th className="px-4 py-3 text-center">Oportunidades</th>
              <th className="px-4 py-3 text-center">Selección</th>
              <th className="px-4 py-3 text-left">Observaciones</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No hay procesos con oportunidades en este ciclo
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`transition-colors hover:bg-gray-50 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <td className="px-4 py-3 font-semibold text-[#2C5959]">
                    {row.proceso}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {row.oportunidades}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selecciones[row.id]?.seleccion || false}
                      onChange={(e) =>
                        onChange(row.id, "seleccion", e.target.checked)
                      }
                      className="h-4 w-4 accent-[#2C5959]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={selecciones[row.id]?.observaciones || ""}
                      onChange={(e) =>
                        onChange(row.id, "observaciones", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#2C5959]"
                      placeholder="Escribe observaciones..."
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onSave(row)}
                      disabled={guardados[row.id]}
                      className={`px-3 py-1 rounded text-sm font-medium transition ${
                        guardados[row.id]
                          ? "bg-green-600 text-white cursor-default"
                          : "bg-[#2C5959] text-white hover:bg-[#246d6d]"
                      }`}
                    >
                      {guardados[row.id] ? "Guardado ✅" : "Guardar"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
