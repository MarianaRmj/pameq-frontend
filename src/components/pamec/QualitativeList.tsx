"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import { toast } from "sonner";

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
  | "oportunidades"
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
  const [loading, setLoading] = useState(true);

  // Etiquetas amigables
  const labelMap: Record<Tipo, string> = {
    fortalezas: "Fortalezas",
    oportunidades: "Oportunidades de Mejora",
    efecto_oportunidades: "Efecto de las Oportunidades",
    acciones_mejora: "Acciones de Mejora",
    limitantes_acciones: "Limitantes de las Acciones",
  };

  const endpointMap: Record<Tipo, string> = {
    fortalezas: "fortalezas",
    oportunidades: "oportunidades_mejora",
    efecto_oportunidades: "efecto_oportunidades",
    acciones_mejora: "acciones_mejora",
    limitantes_acciones: "limitantes_acciones",
  };

  const label = labelMap[tipo];
  const endpoint = endpointMap[tipo];

  // 🔄 Cargar datos iniciales
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const res = await api<AddItemResponse>(
          `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa?autoevaluacionId=${autoevaluacionId}`
        );

        switch (tipo) {
          case "fortalezas":
            setItems(res.fortalezas ?? []);
            break;
          case "oportunidades":
            setItems(res.oportunidades_mejora ?? res.oportunidades ?? []);
            break;
          case "efecto_oportunidades":
            setItems(res.efecto_oportunidades ?? []);
            break;
          case "acciones_mejora":
            setItems(res.acciones_mejora ?? []);
            break;
          case "limitantes_acciones":
            setItems(res.limitantes_acciones ?? []);
            break;
        }
      } catch (err) {
        console.error(`❌ Error cargando ${tipo}:`, err);
        toast.error("Error cargando datos");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [estandarId, autoevaluacionId, tipo, setItems]);

  // 🔧 Función común para actualizar lista según respuesta
  const actualizarLista = (res: AddItemResponse, fallback?: () => void) => {
    switch (tipo) {
      case "fortalezas":
        if (res.fortalezas) return setItems(res.fortalezas);
        break;
      case "oportunidades":
        if (res.oportunidades_mejora) return setItems(res.oportunidades_mejora);
        if (res.oportunidades) return setItems(res.oportunidades);
        break;
      case "efecto_oportunidades":
        if (res.efecto_oportunidades) return setItems(res.efecto_oportunidades);
        break;
      case "acciones_mejora":
        if (res.acciones_mejora) return setItems(res.acciones_mejora);
        break;
      case "limitantes_acciones":
        if (res.limitantes_acciones) return setItems(res.limitantes_acciones);
        break;
    }
    if (fallback) fallback();
  };

  // ➕ Agregar
  const guardar = async () => {
    const texto = nuevo.trim();
    if (!texto) return toast.warning("Debes escribir algo antes de guardar");

    try {
      setAgregando(true);
      const res = await api<AddItemResponse>(
        `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ autoevaluacionId, text: texto }),
        }
      );

      actualizarLista(res);
      setNuevo("");
      toast.success("Agregado");
    } catch (err) {
      console.error("❌ Error agregando:", err);
      toast.error("No se pudo agregar");
    } finally {
      setAgregando(false);
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

      actualizarLista(res, () => setItems(items.filter((_, i) => i !== idx)));

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

      actualizarLista(res, () => {
        const copia = [...items];
        copia[index] = texto;
        setItems(copia);
      });

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
                placeholder={`Escribe una ${label.toLowerCase()}...`}
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
