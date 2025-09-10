"use client";

import { useState } from "react";
import { api } from "@/app/lib/api";
import { toast } from "sonner";
import { PlusCircle, Trash2, Save, XCircle } from "lucide-react";

interface AddItemResponse {
  fortalezas?: string[];
  oportunidades_mejora?: string[];
  oportunidades?: string[];
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
  items: string[];
  setItems: (items: string[]) => void;
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

  // Etiquetas legibles
  const labels: Record<Tipo, string> = {
    fortalezas: "Fortalezas",
    oportunidades_mejora: "Oportunidades de Mejora",
    efecto_oportunidades: "Efectos de las Oportunidades",
    acciones_mejora: "Acciones de Mejora",
    limitantes_acciones: "Limitantes de las Acciones",
  };

  const endpoint = tipo;

  // ➕ Agregar
  const guardar = async () => {
    const texto = nuevo.trim();
    if (!texto) return toast.warning("Debes escribir algo antes de guardar");

    try {
      const res = await api<AddItemResponse>(
        `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ autoevaluacionId, text: texto }),
        }
      );

      setItems(res[endpoint] ?? [...items, texto]);
      setNuevo("");
      setAgregando(false);
      toast.success("Agregado");
    } catch (err) {
      console.error("❌ Error agregando:", err);
      toast.error("No se pudo agregar");
    }
  };

  // 🗑️ Eliminar
  const eliminar = async (idx: number) => {
    if (!confirm("¿Deseas eliminar este ítem?")) return;

    const value = items[idx];
    if (value == null) return;

    try {
      const res = await api<AddItemResponse>(
        `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa/${endpoint}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value, autoevaluacionId }),
        }
      );

      setItems(res[endpoint] ?? items.filter((_, i) => i !== idx));
      toast.success("Ítem eliminado");
    } catch (err) {
      console.error("❌ Error eliminando:", err);
      toast.error("No se pudo eliminar");
    }
  };

  // ✏️ Editar
  const editar = async (index: number, textoNuevo: string) => {
    const texto = textoNuevo.trim();
    if (!texto) return;

    try {
      const res = await api<AddItemResponse>(
        `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa/${endpoint}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ autoevaluacionId, index, text: texto }),
        }
      );

      setItems(res[endpoint] ?? items.map((v, i) => (i === index ? texto : v)));
      toast.success("Actualizado");
    } catch (err) {
      console.error("❌ Error editando:", err);
      toast.error("No se pudo editar");
    }
  };

  return (
    <div className="mb-8 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Título */}
      <h4 className="text-lg font-semibold text-verdeOscuro mb-3">
        {labels[tipo]}
      </h4>

      {/* Estado vacío */}
      {items.length === 0 && (
        <p className="text-sm text-gray-500 italic mb-3">
          Aún no has agregado {labels[tipo].toLowerCase()}.
        </p>
      )}

      {/* Lista de ítems */}
      <ul className="space-y-3">
        {items.map((item, index) => (
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
                // Autoexpandir altura
                e.currentTarget.style.height = "auto";
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
              }}
              onBlur={(e) => editar(index, e.target.value)}
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
        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <textarea
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            placeholder={`Escribe una ${labels[tipo].toLowerCase()}...`}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-verdeClaro focus:outline-none mb-3 bg-white"
          />
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
