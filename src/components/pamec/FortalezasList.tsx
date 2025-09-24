"use client";

import { useState, useEffect } from "react";
import { api } from "@/app/lib/api";
import { toast } from "sonner";
import { Save, XCircle, PlusCircle } from "lucide-react";

type Proceso = { id: number; nombre_proceso: string };
type Fortaleza = { id: number; descripcion: string; procesos: Proceso[] };

export default function FortalezasList({
  autoevaluacionId,
  estandarId,
  confirmado = false,
}: {
  autoevaluacionId: number;
  estandarId: number;
  confirmado?: boolean;
}) {
  const [fortalezas, setFortalezas] = useState<Fortaleza[]>([]);
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [nuevo, setNuevo] = useState("");
  const [procesosSel, setProcesosSel] = useState<number[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [agregando, setAgregando] = useState(false);
  const [evaluacionId, setEvaluacionId] = useState<number | null>(null);

  // 🔹 Cargar procesos, fortalezas y evaluacionId real
  useEffect(() => {
    api<{ id: number }>(
      `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa?autoevaluacionId=${autoevaluacionId}`
    )
      .then((data) => {
        if (data && data.id) setEvaluacionId(data.id);
      })
      .catch(() => toast.error("Error cargando evaluación"));

    api<Proceso[]>("/processes")
      .then(setProcesos)
      .catch(() => toast.error("Error cargando procesos"));

    api<Fortaleza[]>(
      `/evaluacion/fortalezas/${autoevaluacionId}/estandar/${estandarId}`
    )
      .then(setFortalezas)
      .catch(() => toast.error("Error cargando fortalezas"));
  }, [autoevaluacionId, estandarId]);

  const agregar = async () => {
    if (!nuevo.trim())
      return toast.warning("La descripción no puede estar vacía");
    if (procesosSel.length === 0)
      return toast.warning("Selecciona al menos un proceso");
    if (!evaluacionId)
      return toast.error("No se encontró la evaluación asociada");

    try {
      const nueva = await api<Fortaleza>("/evaluacion/fortalezas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluacionId,
          estandarId,
          descripcion: nuevo,
          procesosIds: procesosSel,
        }),
      });
      setFortalezas([...fortalezas, nueva]);
      setNuevo("");
      setProcesosSel([]);
      setAgregando(false);
      toast.success("Fortaleza agregada");
    } catch {
      toast.error("No se pudo agregar");
    }
  };

  const guardarEdicion = async (index: number, id: number) => {
    try {
      const actualizada = await api<Fortaleza>("/evaluacion/fortalezas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          descripcion: editValue,
          procesosIds: procesosSel,
        }),
      });
      const nuevas = [...fortalezas];
      nuevas[index] = actualizada;
      setFortalezas(nuevas);
      setEditIndex(null);
      setEditValue("");
      setProcesosSel([]);
      toast.success("Fortaleza actualizada");
    } catch {
      toast.error("No se pudo actualizar");
    }
  };

  const eliminar = async (id: number) => {
    try {
      await api(`/evaluacion/fortalezas/${id}`, { method: "DELETE" });
      setFortalezas(fortalezas.filter((f) => f.id !== id));
      toast.success("Fortaleza eliminada");
    } catch {
      toast.error("No se pudo eliminar");
    }
  };

  return (
    <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h4 className="text-lg font-semibold text-verdeOscuro mb-4">
        Fortalezas
      </h4>

      <ul className="space-y-4">
        {fortalezas.map((f, index) => (
          <li
            key={f.id}
            className="bg-gray-50 border rounded-xl p-4 flex flex-col gap-3 relative"
          >
            {editIndex === index ? (
              <>
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  disabled={confirmado}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-verdeClaro"
                  rows={2}
                />

                {/* Procesos en edición */}
                <div className="flex flex-wrap gap-2">
                  {procesos.map((p) => (
                    <label
                      key={p.id}
                      className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition ${
                        procesosSel.includes(p.id)
                          ? "bg-verdeClaro/20 border-verdeClaro text-verdeOscuro font-medium"
                          : "bg-white border-gray-300 hover:bg-verdeSuave/20"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={procesosSel.includes(p.id)}
                        onChange={() =>
                          setProcesosSel((prev) =>
                            prev.includes(p.id)
                              ? prev.filter((x) => x !== p.id)
                              : [...prev, p.id]
                          )
                        }
                      />
                      {p.nombre_proceso}
                    </label>
                  ))}
                </div>

                {!confirmado && (
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => guardarEdicion(index, f.id)}
                      className="flex items-center gap-2 bg-verdeOscuro text-white px-3 py-1.5 text-sm rounded-lg hover:bg-verdeClaro transition"
                    >
                      <Save className="w-4 h-4" /> Guardar
                    </button>
                    <button
                      onClick={() => {
                        setEditIndex(null);
                        setEditValue("");
                        setProcesosSel([]);
                      }}
                      className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
                    >
                      <XCircle className="w-4 h-4" /> Cancelar
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-sm">{f.descripcion}</p>
                <small className="text-gray-500">
                  Procesos:{" "}
                  {f.procesos.length > 0
                    ? f.procesos.map((p) => p.nombre_proceso).join(", ")
                    : "Sin procesos asociados"}
                </small>
                {!confirmado && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => {
                        setEditIndex(index);
                        setEditValue(f.descripcion);
                        setProcesosSel(f.procesos.map((p) => p.id));
                      }}
                      title="Editar"
                      className="hover:text-verdeOscuro"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => eliminar(f.id)}
                      title="Eliminar"
                      className="hover:text-rose-600"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>

      {fortalezas.length === 0 && (
        <p className="text-sm text-gray-500 italic mb-3">
          Aún no has agregado fortalezas
        </p>
      )}

      {!confirmado && (
        <>
          {agregando ? (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg border space-y-3 shadow-sm">
              <textarea
                className="block w-full px-4 py-3 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-verdeClaro bg-white"
                value={nuevo}
                onChange={(e) => setNuevo(e.target.value)}
                placeholder="Nueva fortaleza..."
              />
              <div className="flex flex-wrap gap-2">
                {procesos.map((p) => (
                  <label
                    key={p.id}
                    className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition ${
                      procesosSel.includes(p.id)
                        ? "bg-verdeClaro/20 border-verdeClaro text-verdeOscuro font-medium"
                        : "bg-white border-gray-300 hover:bg-verdeSuave/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={procesosSel.includes(p.id)}
                      onChange={() =>
                        setProcesosSel((prev) =>
                          prev.includes(p.id)
                            ? prev.filter((x) => x !== p.id)
                            : [...prev, p.id]
                        )
                      }
                    />
                    {p.nombre_proceso}
                  </label>
                ))}
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={agregar}
                  className="flex items-center gap-2 bg-verdeOscuro text-white text-sm px-4 py-2 rounded-lg hover:bg-verdeClaro transition"
                >
                  <Save className="w-4 h-4" /> Guardar
                </button>
                <button
                  onClick={() => {
                    setNuevo("");
                    setProcesosSel([]);
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
          )}
        </>
      )}
    </div>
  );
}
