"use client";

import { useState, useEffect } from "react";
import { api } from "@/app/lib/api";
import { toast } from "sonner";
import { PlusCircle, Trash2, Save, XCircle, Edit2 } from "lucide-react";

interface AddItemResponse {
  fortalezas?: string[];
  oportunidades_mejora?: string[];
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
  confirmado?: boolean;
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

  // Estados de edición
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

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

  // Guardar nuevo ítem
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

  // Guardar edición existente
  const guardarEdicion = async (index: number, id?: number) => {
    if (confirmado) return;
    const texto = editValue.trim();
    if (!texto) return toast.warning("No puedes dejarlo vacío");

    if (tipo === "oportunidades_mejora" && id) {
      try {
        const actualizada = await api<Oportunidad>(
          "/evaluacion/oportunidades-mejora",
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, descripcion: texto }),
          }
        );
        setOportunidades((prev) =>
          prev.map((o) => (o.id === id ? actualizada : o))
        );
        setEditIndex(null);
        setEditValue("");
        toast.success("Oportunidad actualizada");
      } catch (err) {
        console.error("❌ Error actualizando:", err);
        toast.error("No se pudo actualizar");
      }
    } else {
      try {
        const res = await api<AddItemResponse>(
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
      } catch (err) {
        console.error("❌ Error editando:", err);
        toast.error("No se pudo editar");
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
    <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h4 className="text-lg font-semibold text-verdeOscuro mb-4">
        {labels[tipo]}
      </h4>

      {tipo === "oportunidades_mejora" ? (
        <>
          <ul className="space-y-4">
            {oportunidades.map((o, index) => (
              <li
                key={o.id}
                className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
              >
                {editIndex === index ? (
                  <>
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-verdeClaro"
                      rows={2}
                    />
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => guardarEdicion(index, o.id)}
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

                    {/* Procesos como chips */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {procesos.map((p) => {
                        const checked = o.procesos?.some(
                          (proc) => proc.id === p.id
                        );
                        return (
                          <label
                            key={p.id}
                            className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition
                              ${
                                checked
                                  ? "bg-verdeClaro/20 border-verdeClaro text-verdeOscuro font-medium"
                                  : "bg-white border-gray-300 hover:bg-verdeSuave/20"
                              }`}
                          >
                            <input
                              type="checkbox"
                              className="hidden"
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
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <textarea
                        value={o.descripcion}
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
                              setEditValue(o.descripcion);
                            }}
                            className="p-2 rounded-full bg-verdeSuave hover:bg-verdeClaro/40 text-verdeOscuro transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            title="Eliminar"
                            onClick={() => eliminar(o.id)}
                            className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Procesos como chips */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {procesos.map((p) => {
                        const checked = o.procesos?.some(
                          (proc) => proc.id === p.id
                        );
                        return (
                          <label
                            key={p.id}
                            className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition
                              ${
                                checked
                                  ? "bg-verdeClaro/20 border-verdeClaro text-verdeOscuro font-medium"
                                  : "bg-white border-gray-300 hover:bg-verdeSuave/20"
                              }`}
                          >
                            <input
                              type="checkbox"
                              className="hidden"
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
                  </>
                )}
              </li>
            ))}
          </ul>

          {/* Nuevo */}
          {!confirmado &&
            (agregando ? (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg border space-y-3 shadow-sm">
                <textarea
                  value={nuevo}
                  onChange={(e) => setNuevo(e.target.value)}
                  placeholder="Escribe una oportunidad de mejora..."
                  className="block w-full px-4 py-3 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-verdeClaro bg-white"
                />
                <div className="flex flex-wrap gap-2">
                  {procesos.map((p) => (
                    <label
                      key={p.id}
                      className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition
                        ${
                          procesosSeleccionados.includes(p.id)
                            ? "bg-verdeClaro/20 border-verdeClaro text-verdeOscuro font-medium"
                            : "bg-white border-gray-300 hover:bg-verdeSuave/20"
                        }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
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
        </>
      ) : (
        <>
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

          {/* Nuevo */}
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
        </>
      )}
    </div>
  );
}
