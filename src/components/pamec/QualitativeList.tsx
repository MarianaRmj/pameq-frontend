"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import { toast } from "sonner";

interface AddItemResponse {
  fortalezas?: string[];
  oportunidades?: string[];
}

type Tipo = "fortalezas" | "oportunidades";

interface Props {
  tipo: Tipo;
  estandarId: number;
  autoevaluacionId: number;
  items: string[]; // ✅ Levantado al padre
  setItems: (items: string[]) => void; // ✅ Levantado al padre
}

export default function QualitativeList({
  tipo,
  estandarId,
  autoevaluacionId,
  items,
  setItems,
}: Props) {
  const [nuevo, setNuevo] = useState("");
  const [agregando, setAgregando] = useState(false);
  const [loading, setLoading] = useState(true);

  const isFortaleza = tipo === "fortalezas";
  const label = isFortaleza ? "Fortalezas" : "Oportunidades de Mejora";

  const createEndpoint = isFortaleza ? "fortalezas" : "oportunidades_mejora";
  const mutateEndpoint = isFortaleza ? "fortalezas" : "oportunidades";

  // 🔄 Cargar datos iniciales
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const res = await api<{
          fortalezas: string[];
          oportunidades_mejora: string[];
        }>(
          `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa?autoevaluacionId=${autoevaluacionId}`
        );
        setItems(
          isFortaleza ? res.fortalezas ?? [] : res.oportunidades_mejora ?? []
        );
      } catch (err) {
        console.error(`❌ Error cargando ${tipo}:`, err);
        toast.error("Error cargando datos");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [estandarId, autoevaluacionId, tipo, setItems, isFortaleza]);

  const guardar = async () => {
    const texto = nuevo.trim();
    if (!texto) return toast.warning("Debes escribir algo antes de guardar");

    try {
      setAgregando(true);
      const res = await api<AddItemResponse>(
        `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa/${createEndpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ autoevaluacionId, text: texto }),
        }
      );

      setItems(isFortaleza ? res.fortalezas ?? [] : res.oportunidades ?? []);
      setNuevo("");
      toast.success("Agregado");
    } catch (err) {
      console.error("❌ Error agregando:", err);
      toast.error("No se pudo agregar");
    } finally {
      setAgregando(false);
    }
  };

  const eliminar = async (idx: number) => {
    if (!confirm("¿Deseas eliminar este ítem?")) return;

    const value = items[idx];
    if (value == null) return;

    try {
      const res = await api<AddItemResponse>(
        `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa/${mutateEndpoint}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value, autoevaluacionId }),
        }
      );
      setItems(isFortaleza ? res.fortalezas ?? [] : res.oportunidades ?? []);
      toast.success("Ítem eliminado");
    } catch (err) {
      console.error("❌ Error eliminando:", err);
      toast.error("No se pudo eliminar");
    }
  };

  const editar = async (index: number, textoNuevo: string) => {
    const texto = textoNuevo.trim();
    if (!texto) return;

    try {
      const res = await api<AddItemResponse>(
        `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa/${mutateEndpoint}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ autoevaluacionId, index, text: texto }),
        }
      );
      setItems(isFortaleza ? res.fortalezas ?? [] : res.oportunidades ?? []);
      toast.success("Actualizado");
    } catch (err) {
      console.error("❌ Error editando:", err);
      toast.error("No se pudo editar");
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-800 font-nunito text-md mb-2">
        {label}
      </label>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : (
        <>
          {items.length === 0 && (
            <p className="text-sm text-gray-500 mb-2">
              Aún no has agregado {label.toLowerCase()}.
            </p>
          )}

          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className="group relative">
                <textarea
                  value={item}
                  onChange={(e) => {
                    const nuevos = [...items];
                    nuevos[index] = e.target.value;
                    setItems(nuevos);
                  }}
                  onBlur={(e) => editar(index, e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-verdeClaro focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => eliminar(index)}
                  className="absolute top-1 right-1 text-red-600 text-xs opacity-0 group-hover:opacity-100 hover:underline"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>

          {agregando ? (
            <div className="mt-3">
              <textarea
                value={nuevo}
                onChange={(e) => setNuevo(e.target.value)}
                placeholder={`Escribe una ${
                  isFortaleza ? "fortaleza" : "oportunidad"
                }...`}
                className="block w-full px-4 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-verdeClaro focus:outline-none mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={guardar}
                  className="bg-verdeOscuro text-white text-sm px-3 py-1 rounded hover:bg-verdeClaro transition"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setNuevo("");
                    setAgregando(false);
                  }}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAgregando(true)}
              className="mt-3 text-verdeOscuro text-sm font-semibold hover:text-verdeClaro transition"
            >
              + Agregar
            </button>
          )}
        </>
      )}
    </div>
  );
}
