"use client";

import { useState, useEffect } from "react";
import { api } from "@/app/lib/api";
import { toast } from "sonner";
import { PlusCircle, Trash2, Save, XCircle } from "lucide-react";

interface AddItemResponse {
  fortalezas?: string[];
  efecto_oportunidades?: string[];
  acciones_mejora?: string[];
  limitantes_acciones?: string[];
}

type Tipo =
  | "fortalezas"
  | "oportunidades_mejora"
  | "efecto_oportunidades"
  | "acciones_mejora"
  | "limitantes_acciones";

interface Props {
  tipo: Tipo;
  estandarId: number;
  autoevaluacionId: number;
  items: string[]; // usado en todo excepto oportunidades
  setItems: (items: string[]) => void;
}

type Proceso = { id: number; nombre_proceso: string };
type Oportunidad = { id: number; descripcion: string; proceso?: Proceso };

export default function QualitativeList({
  tipo,
  estandarId,
  autoevaluacionId,
  items,
  setItems,
}: Props) {
  // Estado general
  const [nuevo, setNuevo] = useState("");
  const [agregando, setAgregando] = useState(false);

  // Solo para oportunidades
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [nuevoProcesoId, setNuevoProcesoId] = useState<number | "">("");

  // Etiquetas legibles
  const labels: Record<Tipo, string> = {
    fortalezas: "Fortalezas",
    oportunidades_mejora: "Oportunidades de Mejora",
    efecto_oportunidades: "Efectos de las Oportunidades",
    acciones_mejora: "Acciones de Mejora",
    limitantes_acciones: "Limitantes de las Acciones",
  };

  // Cargar procesos y oportunidades si es el caso
  useEffect(() => {
    if (tipo === "oportunidades_mejora") {
      api<Proceso[]>("/processes")
        .then(setProcesos)
        .catch(() => toast.error("Error cargando procesos"));
      api<Oportunidad[]>(`/evaluacion/oportunidades-mejora/${autoevaluacionId}`)
        .then(setOportunidades)
        .catch(() => toast.error("Error cargando oportunidades"));
    }
  }, [tipo, autoevaluacionId]);

  // ➕ Guardar nuevo ítem
  const guardar = async () => {
    const texto = nuevo.trim();
    if (!texto) return toast.warning("Debes escribir algo antes de guardar");

    if (tipo === "oportunidades_mejora") {
      if (!nuevoProcesoId) return toast.warning("Selecciona un proceso");

      try {
        const nueva = await api<Oportunidad>(
          "/evaluacion/oportunidades-mejora",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              evaluacionId: autoevaluacionId,
              descripcion: texto,
              procesoId: nuevoProcesoId,
            }),
          }
        );
        setOportunidades([...oportunidades, nueva]);
        setNuevo("");
        setNuevoProcesoId("");
        setAgregando(false);
        toast.success("Oportunidad agregada");
      } catch (err) {
        console.error("❌ Error agregando:", err);
        toast.error("No se pudo agregar");
      }
    } else {
      try {
        const res = await api<AddItemResponse>(
          `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa/${tipo}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ autoevaluacionId, text: texto }),
          }
        );
        setItems(res[tipo] ?? [...items, texto]);
        setNuevo("");
        setAgregando(false);
        toast.success("Agregado");
      } catch (err) {
        console.error("❌ Error agregando:", err);
        toast.error("No se pudo agregar");
      }
    }
  };

  // 🗑️ Eliminar
  const eliminar = async (idOrIndex: number) => {
    if (!confirm("¿Deseas eliminar este ítem?")) return;

    if (tipo === "oportunidades_mejora") {
      try {
        await api(`/evaluacion/oportunidades-mejora/${idOrIndex}`, {
          method: "DELETE",
        });
        setOportunidades(oportunidades.filter((o) => o.id !== idOrIndex));
        toast.success("Oportunidad eliminada");
      } catch (err) {
        console.error("❌ Error eliminando:", err);
        toast.error("No se pudo eliminar");
      }
    } else {
      const value = items[idOrIndex];
      try {
        const res = await api<AddItemResponse>(
          `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa/${tipo}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value, autoevaluacionId }),
          }
        );
        setItems(res[tipo] ?? items.filter((_, i) => i !== idOrIndex));
        toast.success("Ítem eliminado");
      } catch (err) {
        console.error("❌ Error eliminando:", err);
        toast.error("No se pudo eliminar");
      }
    }
  };

  return (
    <div className="mb-8 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h4 className="text-lg font-semibold text-verdeOscuro mb-3">
        {labels[tipo]}
      </h4>

      {/* Estado vacío */}
      {tipo === "oportunidades_mejora"
        ? oportunidades.length === 0 && (
            <p className="text-sm text-gray-500 italic mb-3">
              Aún no has agregado {labels[tipo].toLowerCase()}.
            </p>
          )
        : items.length === 0 && (
            <p className="text-sm text-gray-500 italic mb-3">
              Aún no has agregado {labels[tipo].toLowerCase()}.
            </p>
          )}

      {/* Lista de ítems */}
      <ul className="space-y-3">
        {tipo === "oportunidades_mejora"
          ? oportunidades.map((o) => (
              <li
                key={o.id}
                className="flex flex-col md:flex-row md:items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <textarea
                  value={o.descripcion}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100"
                  rows={2}
                />
                <select
                  value={o.proceso?.id || ""}
                  disabled
                  className="w-52 text-sm border border-gray-300 rounded-lg bg-gray-100"
                >
                  <option value="">Sin proceso</option>
                  {procesos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre_proceso}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => eliminar(o.id)}
                  className="text-red-500 hover:text-red-700 transition"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))
          : items.map((item, index) => (
              <li
                key={index}
                className="relative group flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <textarea
                  value={item}
                  onChange={(e) => {
                    const nuevos = [...items];
                    nuevos[index] = e.target.value;
                    setItems(nuevos);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-verdeClaro focus:outline-none resize-y overflow-hidden bg-white"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={() => eliminar(index)}
                  className="text-red-500 hover:text-red-700 transition mt-1 opacity-0 group-hover:opacity-100"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
      </ul>

      {/* Nuevo ítem */}
      {agregando ? (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
          <textarea
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            placeholder={`Escribe una ${labels[tipo].toLowerCase()}...`}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-verdeClaro focus:outline-none bg-white"
          />
          {tipo === "oportunidades_mejora" && (
            <select
              value={nuevoProcesoId}
              onChange={(e) => setNuevoProcesoId(Number(e.target.value))}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-verdeClaro focus:outline-none bg-white"
            >
              <option value="">Selecciona un proceso...</option>
              {procesos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre_proceso}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-3 justify-end">
            <button
              onClick={guardar}
              className="flex items-center gap-2 bg-verdeOscuro text-white text-sm px-4 py-2 rounded-lg hover:bg-verdeClaro transition"
            >
              <Save className="w-4 h-4" /> Guardar
            </button>
            <button
              onClick={() => {
                setNuevo("");
                setNuevoProcesoId("");
                setAgregando(false);
              }}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition"
            >
              <XCircle className="w-4 h-4" /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAgregando(true)}
          className="mt-4 flex items-center gap-2 text-verdeOscuro text-sm font-semibold hover:text-verdeClaro transition"
        >
          <PlusCircle className="w-5 h-5" /> Agregar
        </button>
      )}
    </div>
  );
}
