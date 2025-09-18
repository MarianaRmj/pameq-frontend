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
  items: string[];
  setItems: (items: string[]) => void;
  confirmado?: boolean; // 👈 nuevo
}

type Proceso = { id: number; nombre_proceso: string };
type Oportunidad = { id: number; descripcion: string; procesos: Proceso[] };

export default function QualitativeList({
  tipo,
  estandarId,
  autoevaluacionId,
  items,
  setItems,
  confirmado = false,
}: Props) {
  const [nuevo, setNuevo] = useState("");
  const [agregando, setAgregando] = useState(false);

  // Solo para oportunidades
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [procesosSeleccionados, setProcesosSeleccionados] = useState<number[]>(
    []
  );

  const labels: Record<Tipo, string> = {
    fortalezas: "Fortalezas",
    oportunidades_mejora: "Oportunidades de Mejora",
    efecto_oportunidades: "Efectos de las Oportunidades",
    acciones_mejora: "Acciones de Mejora",
    limitantes_acciones: "Limitantes de las Acciones",
  };

  // 🔄 Cargar procesos y oportunidades
  useEffect(() => {
    if (tipo === "oportunidades_mejora") {
      api<Proceso[]>("/processes")
        .then(setProcesos)
        .catch(() => toast.error("Error cargando procesos"));

      api<Oportunidad[]>(
        `/evaluacion/oportunidades-mejora/${autoevaluacionId}/estandar/${estandarId}`
      )
        .then(setOportunidades)
        .catch(() => toast.error("Error cargando oportunidades"));
    }
  }, [tipo, autoevaluacionId, estandarId]);

  // Guardar
  const guardar = async () => {
    if (confirmado) return;
    const texto = nuevo.trim();
    if (!texto) return toast.warning("Debes escribir algo antes de guardar");

    if (tipo === "oportunidades_mejora") {
      if (procesosSeleccionados.length === 0)
        return toast.warning("Selecciona al menos un proceso");

      try {
        const nueva = await api<Oportunidad>(
          "/evaluacion/oportunidades-mejora",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              evaluacionId: autoevaluacionId,
              descripcion: texto,
              estandarId: estandarId,
              procesosIds: procesosSeleccionados,
            }),
          }
        );
        setOportunidades([...oportunidades, nueva]);
        setNuevo("");
        setProcesosSeleccionados([]);
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

  // Toggle procesos en oportunidad
  const toggleProcesoEnOportunidad = async (
    oportunidadId: number,
    procesoId: number,
    checked: boolean
  ) => {
    if (confirmado) return;
    const oportunidad = oportunidades.find((o) => o.id === oportunidadId);
    if (!oportunidad) return;

    const procesosIds = checked
      ? [...oportunidad.procesos.map((p) => p.id), procesoId]
      : oportunidad.procesos.map((p) => p.id).filter((id) => id !== procesoId);

    try {
      const actualizada = await api<Oportunidad>(
        "/evaluacion/oportunidades-mejora",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: oportunidadId,
            descripcion: oportunidad.descripcion,
            procesosIds,
          }),
        }
      );

      setOportunidades((prev) =>
        prev.map((o) => (o.id === oportunidadId ? actualizada : o))
      );
    } catch (err) {
      console.error("❌ Error actualizando:", err);
      toast.error("No se pudo actualizar procesos");
    }
  };

  // Eliminar
  const eliminar = async (idOrIndex: number) => {
    if (confirmado) return;
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

      {tipo === "oportunidades_mejora" ? (
        <>
          {/* Lista */}
          <ul className="space-y-3">
            {oportunidades.map((o) => (
              <li
                key={o.id}
                className="bg-gray-50 border rounded-lg p-3 space-y-2"
              >
                <textarea
                  value={o.descripcion}
                  readOnly
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100"
                  rows={2}
                />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {procesos.map((p) => {
                    const checked = o.procesos?.some(
                      (proc) => proc.id === p.id
                    );
                    return (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={confirmado}
                          onChange={(e) =>
                            toggleProcesoEnOportunidad(
                              o.id,
                              p.id,
                              e.target.checked
                            )
                          }
                        />
                        {p.nombre_proceso}
                      </label>
                    );
                  })}
                </div>
                {!confirmado && (
                  <button
                    type="button"
                    onClick={() => eliminar(o.id)}
                    className="text-red-500 hover:text-red-700 transition text-sm"
                  >
                    <Trash2 className="w-4 h-4 inline-block mr-1" />
                    Eliminar
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Nuevo */}
          {!confirmado &&
            (agregando ? (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg border space-y-3">
                <textarea
                  value={nuevo}
                  onChange={(e) => setNuevo(e.target.value)}
                  placeholder="Escribe una oportunidad de mejora..."
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-verdeClaro bg-white"
                />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {procesos.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={procesosSeleccionados.includes(p.id)}
                        onChange={(e) =>
                          setProcesosSeleccionados((prev) =>
                            e.target.checked
                              ? [...prev, p.id]
                              : prev.filter((id) => id !== p.id)
                          )
                        }
                      />
                      {p.nombre_proceso}
                    </label>
                  ))}
                </div>
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
                      setProcesosSeleccionados([]);
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
            ))}
        </>
      ) : (
        <>
          {/* Otros tipos */}
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 bg-gray-50 border rounded-lg p-3"
              >
                <textarea
                  value={item}
                  readOnly={confirmado}
                  onChange={(e) => {
                    if (confirmado) return;
                    const nuevos = [...items];
                    nuevos[index] = e.target.value;
                    setItems(nuevos);
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg resize-y ${
                    confirmado
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "focus:ring-2 focus:ring-verdeClaro bg-white"
                  }`}
                  rows={2}
                />
                {!confirmado && (
                  <button
                    type="button"
                    onClick={() => eliminar(index)}
                    className="text-red-500 hover:text-red-700 transition mt-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {!confirmado &&
            (agregando ? (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg border space-y-3">
                <textarea
                  value={nuevo}
                  onChange={(e) => setNuevo(e.target.value)}
                  placeholder={`Escribe una ${labels[tipo].toLowerCase()}...`}
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-verdeClaro bg-white"
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
            ))}
        </>
      )}
    </div>
  );
}
