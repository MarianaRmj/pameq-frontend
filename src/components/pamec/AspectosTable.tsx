"use client";

import { api } from "@/app/lib/api";
import { toast } from "sonner";

// 🔑 Tipo fuerte que refleja tu entity CalificacionEstandar en BD
export type Aspectos = {
  sistematicidad: number;
  proactividad: number;
  ciclo_evaluacion: number;
  despliegue_institucion: number;
  despliegue_cliente: number;
  pertinencia: number;
  consistencia: number;
  avance_medicion: number;
  tendencia: number;
  comparacion: number;
  total_enfoque: number;
  total_implementacion: number;
  total_resultados: number;
  total_estandar: number;
  calificacion: number;
};

export const AspectosTable = ({
  aspectos,
  setAspectos,
  autoevaluacionId,
}: {
  aspectos: Aspectos;
  setAspectos: React.Dispatch<React.SetStateAction<Aspectos>>;
  autoevaluacionId: number;
}) => {
  const categorias = {
    ENFOQUE: [
      "SISTEMATICIDAD Y AMPLITUD",
      "PROACTIVIDAD",
      "CICLOS DE EVALUACIÓN Y MEJORAMIENTO",
    ],
    IMPLEMENTACIÓN: [
      "DESPLIEGUE A LA INSTITUCIÓN",
      "DESPLIEGUE AL CLIENTE INTERNO Y/O EXTERNO",
    ],
    RESULTADO: [
      "PERTINENCIA",
      "CONSISTENCIA",
      "AVANCE A LA MEDICIÓN",
      "TENDENCIA",
      "COMPARACIÓN",
    ],
  };

  // Mapping entre texto mostrado en tabla y columna real en BD
  const mapNombreToColumn: Record<string, keyof Aspectos> = {
    "SISTEMATICIDAD Y AMPLITUD": "sistematicidad",
    PROACTIVIDAD: "proactividad",
    "CICLOS DE EVALUACIÓN Y MEJORAMIENTO": "ciclo_evaluacion",
    "DESPLIEGUE A LA INSTITUCIÓN": "despliegue_institucion",
    "DESPLIEGUE AL CLIENTE INTERNO Y/O EXTERNO": "despliegue_cliente",
    PERTINENCIA: "pertinencia",
    CONSISTENCIA: "consistencia",
    "AVANCE A LA MEDICIÓN": "avance_medicion",
    TENDENCIA: "tendencia",
    COMPARACIÓN: "comparacion",
  };

  const handleChange = async (nombre: string, value: string) => {
    const num = Number(value);
    if (!num) return;

    const key = mapNombreToColumn[nombre];

    // 1️⃣ Actualizar estado local con tipado correcto
    setAspectos((prev) => ({
      ...prev,
      [key]: num,
    }));

    // 2️⃣ Guardar en backend
    try {
      await api(`/evaluacion/cuantitativa`, {
        method: "PATCH",
        body: JSON.stringify({
          autoevaluacionId,
          nombre,
          valor: num,
        }),
      });
      toast.success(`Guardado ${nombre}: ${num}`);
    } catch (error) {
      console.error("Error guardando:", error);
      toast.error("Error al guardar en el servidor");
    }
  };

  return (
    <div className="mt-8 font-nunito max-w-4xl mx-auto ">
      <table className="w-full table-auto border border-gray-600 shadow-sm rounded-lg overflow-hidden text-sm">
        <thead className="bg-[#f9fafb] text-gray-700 uppercase tracking-wide">
          <tr>
            <th className="border border-gray-300 px-3 py-1 text-center w-[35%]">
              Categoría
            </th>
            <th className="border border-gray-300 px-3 py-1 text-center w-[50%]">
              Aspecto
            </th>
            <th className="border border-gray-300 px-3 py-1 text-center w-[15%]">
              Valor
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(categorias).map(([categoria, items]) =>
            items.map((nombre, idx) => {
              const key = mapNombreToColumn[nombre];
              const valor = aspectos ? aspectos[key] ?? "" : "";

              return (
                <tr
                  key={nombre}
                  className="hover:bg-[#f6f6f6] transition-colors duration-200"
                >
                  {idx === 0 ? (
                    <td
                      rowSpan={items.length}
                      className="border border-gray-300 px-3 py-1 font-semibold text-verdeOscuro bg-[#f2f2f2] align-top text-sm"
                    >
                      {categoria}
                    </td>
                  ) : null}
                  <td className="border border-gray-300 px-3 py-1 text-gray-800">
                    {nombre}
                  </td>
                  <td className="border border-gray-300 px-3 py-1 text-center">
                    <select
                      value={valor.toString()}
                      onChange={(e) => handleChange(nombre, e.target.value)}
                      className="w-16 border border-gray-300 rounded-md text-center px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-verdeClaro text-sm"
                    >
                      <option value="">-</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
