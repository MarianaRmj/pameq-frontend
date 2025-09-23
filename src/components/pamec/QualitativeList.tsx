"use client";

import FortalezasList from "./FortalezasList";
import OportunidadesList from "./OportunidadesList";
import { useState } from "react";
import { api } from "@/app/lib/api";
import { toast } from "sonner";
import { PlusCircle, Trash2, Save, XCircle, Edit2 } from "lucide-react";

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
  confirmado?: boolean;
}

const labels: Record<Tipo, string> = {
  fortalezas: "Fortalezas",
  oportunidades_mejora: "Oportunidades de Mejora",
  efecto_oportunidades: "Efectos de las Oportunidades",
  acciones_mejora: "Acciones de Mejora",
  limitantes_acciones: "Limitantes de las Acciones",
};

export default function QualitativeList({
  tipo,
  estandarId,
  autoevaluacionId,
  items,
  setItems,
  confirmado = false,
}: Props) {
  // Estados para tipos simples
  const [nuevo, setNuevo] = useState("");
  const [agregando, setAgregando] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // 👉 Derivamos a componentes especializados
  if (tipo === "fortalezas") {
    return (
      <FortalezasList
        autoevaluacionId={autoevaluacionId}
        estandarId={estandarId}
        confirmado={confirmado}
      />
    );
  }

  if (tipo === "oportunidades_mejora") {
    return (
      <OportunidadesList
        autoevaluacionId={autoevaluacionId}
        estandarId={estandarId}
        confirmado={confirmado}
      />
    );
  }

  // 👉 Tipos simples se mantienen aquí
  const guardar = async () => {
    if (confirmado) return;
    const texto = nuevo.trim();
    if (!texto) return toast.warning("Debes escribir algo antes de guardar");

    try {
      const res = await api<{ [key in Tipo]?: string[] }>(
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
    } catch {
      toast.error("No se pudo agregar");
    }
  };

  const guardarEdicion = async (index: number) => {
    if (confirmado) return;
    const texto = editValue.trim();
    if (!texto) return toast.warning("No puedes dejarlo vacío");

    try {
      const res = await api<{ [key in Tipo]?: string[] }>(
        `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa/${tipo}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            autoevaluacionId,
            index,
            text: texto,
            oldValue: items[index],
            newValue: texto,
          }),
        }
      );
      setItems(res[tipo] ?? items.map((v, i) => (i === index ? texto : v)));
      setEditIndex(null);
      setEditValue("");
      toast.success("Ítem actualizado");
    } catch {
      toast.error("No se pudo editar");
    }
  };

  const eliminar = async (index: number) => {
    if (confirmado) return;
    if (!confirm("¿Deseas eliminar este ítem?")) return;

    const value = items[index];
    try {
      const res = await api<{ [key in Tipo]?: string[] }>(
        `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa/${tipo}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value, autoevaluacionId }),
        }
      );
      setItems(res[tipo] ?? items.filter((_, i) => i !== index));
      toast.success("Ítem eliminado");
    } catch {
      toast.error("No se pudo eliminar");
    }
  };

  return (
    <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h4 className="text-lg font-semibold text-verdeOscuro mb-4">
        {labels[tipo]}
      </h4>

      {/* 📌 Mensaje cuando está vacío */}
      {items.length === 0 && (
        <p className="text-sm text-gray-500 italic mb-3">
          Aún no has agregado {labels[tipo].toLowerCase()}
        </p>
      )}

      <ul className="space-y-4">
        {items.map((item, index) => (
          <li
            key={index}
            className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
          >
            {editIndex === index ? (
              <>
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-4 py-3 text-sm border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-verdeClaro"
                  rows={2}
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => guardarEdicion(index)}
                    className="flex items-center gap-2 bg-verdeOscuro text-white px-4 py-2 text-sm rounded-lg hover:bg-verdeClaro transition"
                  >
                    <Save className="w-4 h-4" /> Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditIndex(null);
                      setEditValue("");
                    }}
                    className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
                  >
                    <XCircle className="w-4 h-4" /> Cancelar
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-3">
                <textarea
                  value={item}
                  readOnly
                  className="flex-1 w-full px-4 py-3 text-sm border rounded-lg bg-gray-100 shadow-sm"
                  rows={2}
                />
                {!confirmado && (
                  <div className="flex flex-col gap-2">
                    <button
                      title="Editar"
                      onClick={() => {
                        setEditIndex(index);
                        setEditValue(item);
                      }}
                      className="p-2 rounded-full bg-verdeSuave hover:bg-verdeClaro/40 text-verdeOscuro transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      title="Eliminar"
                      onClick={() => eliminar(index)}
                      className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      {!confirmado &&
        (agregando ? (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg border space-y-3 shadow-sm">
            <textarea
              value={nuevo}
              onChange={(e) => setNuevo(e.target.value)}
              placeholder={`Escribe una ${labels[tipo].toLowerCase()}...`}
              className="block w-full px-4 py-3 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-verdeClaro bg-white"
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
                className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
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
        ))}
    </div>
  );
}
