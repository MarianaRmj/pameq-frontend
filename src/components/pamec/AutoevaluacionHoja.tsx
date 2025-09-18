"use client";

import { useEffect, useState, useRef } from "react";
import CalificacionGeneralInput from "./CalificacionGeneralInput";
import CriteriosToggle from "./CriteriosToggle";
import QualitativeList from "./QualitativeList";
import { AspectosTable, Aspectos } from "./AspectosTable";
import { api } from "@/app/lib/api";
import {
  ChevronDown,
  ChevronRight,
  Paperclip,
  Trash2,
  Upload,
} from "lucide-react";

type Evidencia = {
  id: number;
  nombre: string;
  url: string;
  fecha_carga?: string;
  nombre_archivo?: string;
  url_archivo?: string;
};

type Estandar = {
  id?: number;
  estandarId?: number;
  grupo: string;
  codigo: string;
  descripcion: string;
  criterios: string[];
};

export default function AutoevaluacionHoja({
  estandar,
  autoevaluacionId,
}: {
  estandar: Estandar;
  autoevaluacionId: number;
}) {
  const estandarId = estandar.id ?? estandar.estandarId;

  // 📊 Cuantitativa
  const [aspectos, setAspectos] = useState<Aspectos>({
    sistematicidad: 0,
    proactividad: 0,
    ciclo_evaluacion: 0,
    despliegue_institucion: 0,
    despliegue_cliente: 0,
    pertinencia: 0,
    consistencia: 0,
    avance_medicion: 0,
    tendencia: 0,
    comparacion: 0,
    total_enfoque: 0,
    total_implementacion: 0,
    total_resultados: 0,
    total_estandar: 0,
    calificacion: 0,
  });

  // 📋 Cualitativa
  const [fortalezas, setFortalezas] = useState<string[]>([]);
  const [oportunidades, setOportunidades] = useState<string[]>([]);
  const [efectoOportunidades, setEfectoOportunidades] = useState<string[]>([]);
  const [accionesMejora, setAccionesMejora] = useState<string[]>([]);
  const [limitantesAcciones, setLimitantesAcciones] = useState<string[]>([]);

  const [mostrarCriterios, setMostrarCriterios] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [mostrarCualitativa, setMostrarCualitativa] = useState(true);
  const [mostrarCuantitativa, setMostrarCuantitativa] = useState(true);

  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const uploadingRef = useRef(false);

  // ✅ Confirmado
  const [confirmado, setConfirmado] = useState(false);

  // 📎 Subir evidencias
  const subirEvidencias = async (files: FileList | null) => {
    if (!files || confirmado) return;
    uploadingRef.current = true;

    const newEvidencias: Evidencia[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("autoevaluacionId", String(autoevaluacionId));
      formData.append("estandarId", String(estandarId));

      try {
        const res = await fetch(
          "http://localhost:3001/evidencia-fortaleza/evidencias/fortalezas",
          { method: "POST", body: formData }
        );

        const data = await res.json();
        if (Array.isArray(data)) {
          const nuevas = data.map(
            (ev: {
              id: number;
              nombre_archivo: string;
              url_archivo: string;
              fecha_carga?: string;
            }) => ({
              id: ev.id,
              nombre: ev.nombre_archivo,
              url: ev.url_archivo,
              fecha_carga: ev.fecha_carga,
            })
          );
          newEvidencias.push(...nuevas);
        }
      } catch (error) {
        console.error("Error subiendo archivo", error);
      }
    }

    setEvidencias((prev) => [...prev, ...newEvidencias]);
    uploadingRef.current = false;
  };

  // 🔄 Cargar datos iniciales
  useEffect(() => {
    if (!estandarId) return;

    const cargarDatos = async () => {
      try {
        // 🔹 Estado confirmado
        try {
          const estado = await api<{
            confirmado: boolean;
            mensaje?: string;
          }>(
            `/autoevaluaciones/${autoevaluacionId}/estandares/${estandarId}/estado`
          );
          setConfirmado(!!estado.confirmado);
        } catch (err) {
          console.warn("⚠️ No se pudo obtener estado:", err);
        }

        // 🔹 Cuantitativa
        type CalificacionResponse = Partial<Aspectos> & {
          confirmado?: boolean;
        };
        const calificacion: CalificacionResponse = await api(
          `/evaluacion/estandares/${estandarId}/calificaciones?autoevaluacionId=${autoevaluacionId}`
        );
        if (calificacion && typeof calificacion === "object") {
          setAspectos((prev) => ({ ...prev, ...calificacion }));
          // respaldo por si backend devuelve confirmado también
          if (calificacion.confirmado) setConfirmado(true);
        }

        // 🔹 Cualitativa
        type CualitativaResponse = {
          fortalezas?: string[];
          oportunidades_mejora?: string[];
          efecto_oportunidades?: string[];
          acciones_mejora?: string[];
          limitantes_acciones?: string[];
        };
        const cualitativa: CualitativaResponse = await api(
          `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa?autoevaluacionId=${autoevaluacionId}`
        );
        if (cualitativa) {
          setFortalezas(cualitativa.fortalezas ?? []);
          setOportunidades(cualitativa.oportunidades_mejora ?? []);
          setEfectoOportunidades(cualitativa.efecto_oportunidades ?? []);
          setAccionesMejora(cualitativa.acciones_mejora ?? []);
          setLimitantesAcciones(cualitativa.limitantes_acciones ?? []);
        }

        // 🔹 Evidencias
        const res = await fetch(
          `http://localhost:3001/evidencia-fortaleza/estandares/${estandarId}/evidencias-fortalezas`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          const precargadas = data.map((ev: Evidencia) => ({
            id: ev.id ?? 0,
            nombre: ev.nombre_archivo ?? "",
            url: ev.url_archivo ?? "",
            fecha_carga: ev.fecha_carga ?? "",
            nombre_archivo: ev.nombre_archivo,
            url_archivo: ev.url_archivo,
          }));
          setEvidencias(precargadas);
        }
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    cargarDatos();
  }, [estandarId, autoevaluacionId]);

  // 📊 Promedio
  const calificacionPromedio = () => {
    const nums = [
      aspectos.sistematicidad,
      aspectos.proactividad,
      aspectos.ciclo_evaluacion,
      aspectos.despliegue_institucion,
      aspectos.despliegue_cliente,
      aspectos.pertinencia,
      aspectos.consistencia,
      aspectos.avance_medicion,
      aspectos.tendencia,
      aspectos.comparacion,
    ].filter((v) => Number.isFinite(v) && v > 0);

    if (!nums.length) return "0.00";
    const suma = nums.reduce((acc, v) => acc + v, 0);
    return (suma / nums.length).toFixed(2);
  };

  // ✅ Confirmar estándar
  const confirmarEstandar = async () => {
    try {
      setSaving(true);
      await api(
        `/autoevaluaciones/${autoevaluacionId}/estandares/${estandarId}/confirmar`,
        { method: "PATCH" }
      );
      setConfirmado(true);
      alert("✅ Estándar confirmado");
    } catch (error) {
      console.error("Error al confirmar estándar:", error);
      alert("Error al confirmar estándar");
    } finally {
      setSaving(false);
    }
  };

  const Section = ({
    title,
    open,
    setOpen,
    children,
  }: {
    title: string;
    open: boolean;
    setOpen: (v: boolean) => void;
    children: React.ReactNode;
  }) => (
    <div className="mb-6 border border-gray-200 rounded-lg shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-t-lg"
      >
        <span className="font-semibold text-verdeOscuro">{title}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        )}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );

  return (
    <div className="p-8 border border-gray-200 rounded-2xl bg-white shadow-lg mb-10 max-w-5xl mx-auto font-nunito">
      <h2 className="text-2xl text-verdeOscuro mb-2">
        {estandar.grupo} - {estandar.codigo}
      </h2>

      {estandar.descripcion && (
        <p className="text-gray-700 mb-4 text-justify text-sm whitespace-pre-line leading-relaxed">
          {estandar.descripcion}
        </p>
      )}

      <CriteriosToggle
        mostrarCriterios={mostrarCriterios}
        setMostrarCriterios={setMostrarCriterios}
        criterios={estandar.criterios}
      />

      {loading ? (
        <p className="text-gray-500">Cargando datos...</p>
      ) : (
        <>
          {/* --- Cualitativa --- */}
          <Section
            title="Evaluación Cualitativa"
            open={mostrarCualitativa}
            setOpen={setMostrarCualitativa}
          >
            <div className="space-y-4">
              <QualitativeList
                tipo="fortalezas"
                estandarId={estandarId ?? 0}
                autoevaluacionId={autoevaluacionId}
                items={fortalezas}
                setItems={setFortalezas}
                confirmado={confirmado}
              />

              {/* 📎 Evidencias */}
              <div className="mb-8 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                <h4 className="text-lg font-semibold text-verdeOscuro mb-3 flex items-center gap-2">
                  <Paperclip className="w-5 h-5" />
                  Evidencias de fortalezas
                </h4>

                {!confirmado && (
                  <label className="flex items-center justify-center w-full cursor-pointer bg-verdeClaro text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-verdeOscuro transition">
                    <Upload className="w-4 h-4 mr-2" />
                    Subir archivos
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
                      className="hidden"
                      onChange={(e) => subirEvidencias(e.target.files)}
                    />
                  </label>
                )}

                {evidencias.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {evidencias.map((ev, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      >
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-verdeOscuro hover:underline"
                        >
                          📄 {ev.nombre}
                        </a>
                        {!confirmado && (
                          <button
                            onClick={async () => {
                              if (!confirm("¿Deseas eliminar esta evidencia?"))
                                return;
                              try {
                                const res = await fetch(
                                  `http://localhost:3001/evidencia-fortaleza/evidencias/${ev.id}`,
                                  { method: "DELETE" }
                                );
                                if (res.ok) {
                                  setEvidencias((prev) =>
                                    prev.filter((e) => e.id !== ev.id)
                                  );
                                } else {
                                  alert("❌ Error eliminando evidencia");
                                }
                              } catch (err) {
                                console.error("❌ Error eliminando:", err);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 transition"
                            title="Eliminar evidencia"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <QualitativeList
                tipo="oportunidades_mejora"
                estandarId={estandarId ?? 0}
                autoevaluacionId={autoevaluacionId}
                items={oportunidades}
                setItems={setOportunidades}
                confirmado={confirmado}
              />
              <QualitativeList
                tipo="efecto_oportunidades"
                estandarId={estandarId ?? 0}
                autoevaluacionId={autoevaluacionId}
                items={efectoOportunidades}
                setItems={setEfectoOportunidades}
                confirmado={confirmado}
              />
              <QualitativeList
                tipo="acciones_mejora"
                estandarId={estandarId ?? 0}
                autoevaluacionId={autoevaluacionId}
                items={accionesMejora}
                setItems={setAccionesMejora}
                confirmado={confirmado}
              />
              <QualitativeList
                tipo="limitantes_acciones"
                estandarId={estandarId ?? 0}
                autoevaluacionId={autoevaluacionId}
                items={limitantesAcciones}
                setItems={setLimitantesAcciones}
                confirmado={confirmado}
              />
            </div>
          </Section>

          {/* --- Cuantitativa --- */}
          <Section
            title="Evaluación Cuantitativa"
            open={mostrarCuantitativa}
            setOpen={setMostrarCuantitativa}
          >
            <AspectosTable
              aspectos={aspectos}
              setAspectos={setAspectos}
              autoevaluacionId={autoevaluacionId}
              estandarId={estandarId ?? 0}
              confirmado={confirmado}
            />
            <div className="mt-4">
              <CalificacionGeneralInput promedio={calificacionPromedio()} />
            </div>
          </Section>

          {/* --- Botón confirmar --- */}
          {!confirmado && (
            <div className="flex justify-end mt-6">
              <button
                onClick={confirmarEstandar}
                disabled={saving}
                className="bg-verdeOscuro disabled:opacity-60 text-white px-6 py-2 rounded-lg shadow hover:bg-verdeClaro transition"
              >
                {saving ? "Guardando..." : "Confirmar"}
              </button>
            </div>
          )}

          {confirmado && (
            <p className="text-right text-green-600 font-semibold mt-4">
              ✅ Estándar confirmado
            </p>
          )}
        </>
      )}
    </div>
  );
}
