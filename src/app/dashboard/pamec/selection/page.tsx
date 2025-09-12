"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import { toast } from "sonner";

type RecuentoProceso = {
  id: number;
  proceso: string;
  oportunidades: number;
};

type SeleccionGuardada = {
  id: number;
  proceso: {
    id: number;
    nombre_proceso: string;
  };
  seleccionado: boolean;
  observaciones: string;
  usuario_id: number;
};

export default function SelectionPage() {
  const cicloId = 2025; // 🔧 ajusta al ciclo real
  const [data, setData] = useState<RecuentoProceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecciones, setSelecciones] = useState<
    Record<number, { seleccion: boolean; observaciones: string }>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1️⃣ Recuento de oportunidades
        const recuento = await api<RecuentoProceso[]>(
          `/processes/recuento/${cicloId}`
        );

        // 2️⃣ Selecciones guardadas
        const seleccionados = await api<SeleccionGuardada[]>(
          `/processes/seleccionados/${cicloId}`
        );

        // 3️⃣ Inicializa estado combinando recuento + selecciones guardadas
        const init: Record<
          number,
          { seleccion: boolean; observaciones: string }
        > = {};

        recuento.forEach((r) => {
          const saved = seleccionados.find((s) => s.proceso.id === r.id);
          init[r.id] = {
            seleccion: saved ? saved.seleccionado : false,
            observaciones: saved ? saved.observaciones : "",
          };
        });

        setData(recuento);
        setSelecciones(init);
      } catch (err) {
        console.error("❌ Error cargando datos:", err);
        toast.error("Error cargando datos de selección de procesos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cicloId]);

  const handleChange = (
    procesoId: number,
    field: "seleccion" | "observaciones",
    value: boolean | string
  ) => {
    setSelecciones((prev) => ({
      ...prev,
      [procesoId]: { ...prev[procesoId], [field]: value },
    }));
  };

  const handleSave = async (row: RecuentoProceso) => {
    const payload = {
      cicloId,
      procesoId: row.id, // ✅ ahora se envía el id del proceso
      usuarioId: 5, // 🔧 traerlo de sesión real
      seleccion: selecciones[row.id]?.seleccion,
      observaciones: selecciones[row.id]?.observaciones,
    };

    try {
      await api("/processes/seleccion", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success(`Selección guardada para ${row.proceso}`);
    } catch {
      toast.error("Error al guardar selección");
    }
  };

  if (loading) return <p className="p-4">Cargando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-[#2C5959]">
        Selección de Procesos
      </h1>
      <table className="w-full border-collapse bg-white rounded-lg shadow-md">
        <thead className="bg-[#2C5959] text-white">
          <tr>
            <th className="px-4 py-2 text-left">Proceso</th>
            <th className="px-4 py-2 text-center">Oportunidades</th>
            <th className="px-4 py-2 text-center">Selección (SI/NO)</th>
            <th className="px-4 py-2 text-left">Observaciones</th>
            <th className="px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-500">
                No hay procesos con oportunidades en este ciclo
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2 font-semibold">{row.proceso}</td>
                <td className="px-4 py-2 text-center">{row.oportunidades}</td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selecciones[row.id]?.seleccion || false}
                    onChange={(e) =>
                      handleChange(row.id, "seleccion", e.target.checked)
                    }
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={selecciones[row.id]?.observaciones || ""}
                    onChange={(e) =>
                      handleChange(row.id, "observaciones", e.target.value)
                    }
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="Escribe observaciones..."
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleSave(row)}
                    className="bg-[#2C5959] text-white px-3 py-1 rounded hover:bg-[#246d6d]"
                  >
                    Guardar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
