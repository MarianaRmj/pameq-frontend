"use client";

import { useEffect, useState, useRef } from "react";
import CalificacionGeneralInput from "./CalificacionGeneralInput";
import CriteriosToggle from "./CriteriosToggle";
import QualitativeList from "./QualitativeList";
import { AspectosTable } from "./AspectosTable";
import { api } from "@/app/lib/api";

type Aspecto = { grupo: string; nombre: string; valor?: number | string };

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

  // Estados
  const [aspectos, setAspectos] = useState<Aspecto[]>([]);
  const [fortalezas, setFortalezas] = useState<string[]>([]);
  const [oportunidades, setOportunidades] = useState<string[]>([]);
  const [efectoOportunidades, setEfectoOportunidades] = useState<string[]>([]);
  const [accionesMejora, setAccionesMejora] = useState<string[]>([]);
  const [limitantesAcciones, setLimitantesAcciones] = useState<string[]>([]);

  const [mostrarCriterios, setMostrarCriterios] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const uploadingRef = useRef(false);

  // 📎 Subir evidencias
  const subirEvidencias = async (files: FileList | null) => {
    if (!files) return;
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

        const text = await res.text();
        let data: unknown = {};
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.error("❌ No se pudo parsear JSON:", err);
        }

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
        } else {
          console.warn("❌ Respuesta inesperada:", data);
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
    if (!estandar || !estandarId) return;

    const cargarDatos = async () => {
      try {
        // Calificaciones
        let calificacion = null;
        try {
          calificacion = await api(
            `/evaluacion/estandares/${estandarId}/calificaciones`
          );
        } catch (err) {
          console.warn("⚠️ No se encontró calificación guardada:", err);
        }

        if (calificacion && typeof calificacion === "object") {
          type Calificacion = {
            sistematicidad?: number | string;
            proactividad?: number | string;
            ciclo_evaluacion?: number | string;
            despliegue_institucion?: number | string;
            despliegue_cliente?: number | string;
            pertinencia?: number | string;
            consistencia?: number | string;
            avance_medicion?: number | string;
            tendencia?: number | string;
            comparacion?: number | string;
          };
          const cal = calificacion as Calificacion;
          setAspectos([
            {
              nombre: "SISTEMATICIDAD Y AMPLITUD",
              valor: cal.sistematicidad,
              grupo: estandar.grupo,
            },
            {
              nombre: "PROACTIVIDAD",
              valor: cal.proactividad,
              grupo: estandar.grupo,
            },
            {
              nombre: "CICLOS DE EVALUACIÓN Y MEJORAMIENTO",
              valor: cal.ciclo_evaluacion,
              grupo: estandar.grupo,
            },
            {
              nombre: "DESPLIEGUE A LA INSTITUCIÓN",
              valor: cal.despliegue_institucion,
              grupo: estandar.grupo,
            },
            {
              nombre: "DESPLIEGUE AL CLIENTE INTERNO Y/O EXTERNO",
              valor: cal.despliegue_cliente,
              grupo: estandar.grupo,
            },
            {
              nombre: "PERTINENCIA",
              valor: cal.pertinencia,
              grupo: estandar.grupo,
            },
            {
              nombre: "CONSISTENCIA",
              valor: cal.consistencia,
              grupo: estandar.grupo,
            },
            {
              nombre: "AVANCE A LA MEDICIÓN",
              valor: cal.avance_medicion,
              grupo: estandar.grupo,
            },
            {
              nombre: "TENDENCIA",
              valor: cal.tendencia,
              grupo: estandar.grupo,
            },
            {
              nombre: "COMPARACIÓN",
              valor: cal.comparacion,
              grupo: estandar.grupo,
            },
          ]);
        }

        // Cualitativa
        try {
          const cualitativa = await api(
            `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa?autoevaluacionId=${autoevaluacionId}`
          ) as {
            fortalezas?: string[];
            oportunidades_mejora?: string[];
            efecto_oportunidades?: string[];
            acciones_mejora?: string[];
            limitantes_acciones?: string[];
          } | null;
          if (cualitativa) {
            setFortalezas(cualitativa?.fortalezas ?? []);
            setOportunidades(cualitativa?.oportunidades_mejora ?? []);
            setEfectoOportunidades(cualitativa?.efecto_oportunidades ?? []);
            setAccionesMejora(cualitativa?.acciones_mejora ?? []);
            setLimitantesAcciones(cualitativa?.limitantes_acciones ?? []);
          }
        } catch (err) {
          console.warn("⚠️ No se encontró evaluación cualitativa:", err);
        }

        // Evidencias
        try {
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
        } catch (err) {
          console.warn("⚠️ No se encontraron evidencias:", err);
        }
      } catch (error) {
        console.error("❌ Error general cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    cargarDatos();
  }, [estandar, estandarId, autoevaluacionId]);

  // Helpers
  const get = (nombre: string): number => {
    const asp = aspectos.find((a) => a.nombre === nombre);
    const v =
      typeof asp?.valor === "number"
        ? asp?.valor
        : parseInt(String(asp?.valor ?? "0"));
    return Number.isFinite(v) ? v : 0;
  };

  const sum = (nombres: string[]): number =>
    nombres.reduce((acc, nom) => acc + get(nom), 0);

  const calcularTotalEstandar = (): number =>
    sum([
      "SISTEMATICIDAD Y AMPLITUD",
      "PROACTIVIDAD",
      "CICLOS DE EVALUACIÓN Y MEJORAMIENTO",
      "DESPLIEGUE A LA INSTITUCIÓN",
      "DESPLIEGUE AL CLIENTE INTERNO Y/O EXTERNO",
      "PERTINENCIA",
      "CONSISTENCIA",
      "AVANCE A LA MEDICIÓN",
      "TENDENCIA",
      "COMPARACIÓN",
    ]);

  const calificacionPromedio = () => {
    const nums = aspectos
      .map((a) =>
        typeof a.valor === "number" ? a.valor : parseInt(String(a.valor ?? "0"))
      )
      .filter((v) => Number.isFinite(v) && v > 0) as number[];
    if (!nums.length) return "0.00";
    const suma = nums.reduce((acc, v) => acc + v, 0);
    return (suma / nums.length).toFixed(2);
  };

  // Guardar
  const guardarHoja = async () => {
    if (!estandarId) return alert("No se encontró el ID del estándar.");
    try {
      setSaving(true);

      const calificacionPayload = {
        autoevaluacionId,
        estandarId,
        sistematicidad: get("SISTEMATICIDAD Y AMPLITUD"),
        proactividad: get("PROACTIVIDAD"),
        ciclo_evaluacion: get("CICLOS DE EVALUACIÓN Y MEJORAMIENTO"),
        total_enfoque: sum([
          "SISTEMATICIDAD Y AMPLITUD",
          "PROACTIVIDAD",
          "CICLOS DE EVALUACIÓN Y MEJORAMIENTO",
        ]),
        despliegue_institucion: get("DESPLIEGUE A LA INSTITUCIÓN"),
        despliegue_cliente: get("DESPLIEGUE AL CLIENTE INTERNO Y/O EXTERNO"),
        total_implementacion: sum([
          "DESPLIEGUE A LA INSTITUCIÓN",
          "DESPLIEGUE AL CLIENTE INTERNO Y/O EXTERNO",
        ]),
        pertinencia: get("PERTINENCIA"),
        consistencia: get("CONSISTENCIA"),
        avance_medicion: get("AVANCE A LA MEDICIÓN"),
        tendencia: get("TENDENCIA"),
        comparacion: get("COMPARACIÓN"),
        total_resultados: sum([
          "PERTINENCIA",
          "CONSISTENCIA",
          "AVANCE A LA MEDICIÓN",
          "TENDENCIA",
          "COMPARACIÓN",
        ]),
        total_estandar: calcularTotalEstandar(),
        calificacion: parseFloat(calificacionPromedio()),
        observaciones: "",
      };

      const cualitativaPayload = {
        autoevaluacionId,
        estandarId,
        fortalezas,
        oportunidades_mejora: oportunidades,
        efecto_oportunidades: efectoOportunidades,
        acciones_mejora: accionesMejora,
        limitantes_acciones: limitantesAcciones,
      };

      await api(`/evaluacion/estandares/${estandarId}/calificaciones`, {
        method: "POST",
        body: JSON.stringify(calificacionPayload),
      });

      await api(`/evaluacion/estandares/${estandarId}/evaluacion-cualitativa`, {
        method: "POST",
        body: JSON.stringify(cualitativaPayload),
      });

      alert("✅ Hoja guardada exitosamente");
    } catch (error) {
      console.error("Error al guardar hoja:", error);
      alert("Error al guardar hoja");
    } finally {
      setSaving(false);
    }
  };

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

      {loading ? (
        <p className="text-gray-500">Cargando datos guardados...</p>
      ) : (
        <>
          <CriteriosToggle
            mostrarCriterios={mostrarCriterios}
            setMostrarCriterios={setMostrarCriterios}
            criterios={estandar.criterios}
          />

          <CalificacionGeneralInput promedio={calificacionPromedio()} />

          {typeof estandarId === "number" && (
            <>
              <QualitativeList
                tipo="fortalezas"
                estandarId={estandarId}
                autoevaluacionId={autoevaluacionId}
                items={fortalezas}
                setItems={setFortalezas}
              />
              <QualitativeList
                tipo="oportunidades"
                estandarId={estandarId}
                autoevaluacionId={autoevaluacionId}
                items={oportunidades}
                setItems={setOportunidades}
              />
              <QualitativeList
                tipo="efecto_oportunidades"
                estandarId={estandarId}
                autoevaluacionId={autoevaluacionId}
                items={efectoOportunidades}
                setItems={setEfectoOportunidades}
              />
              <QualitativeList
                tipo="acciones_mejora"
                estandarId={estandarId}
                autoevaluacionId={autoevaluacionId}
                items={accionesMejora}
                setItems={setAccionesMejora}
              />
              <QualitativeList
                tipo="limitantes_acciones"
                estandarId={estandarId}
                autoevaluacionId={autoevaluacionId}
                items={limitantesAcciones}
                setItems={setLimitantesAcciones}
              />
            </>
          )}

          {/* 📎 Subir evidencias */}
          <div className="mt-6">
            <label className="block text-gray-800 font-normal text-md mb-3">
              Evidencias de fortalezas (PDF, Word, Imágenes)
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-verdeClaro file:text-white hover:file:bg-verdeOscuro"
              onChange={(e) => subirEvidencias(e.target.files)}
            />

            {evidencias.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-verdeOscuro">
                {evidencias.map((ev, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span>
                      📄{" "}
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {ev.nombre}
                      </a>
                    </span>
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
                      className="text-red-600 text-xs ml-4 hover:underline"
                    >
                      x
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <AspectosTable aspectos={aspectos} setAspectos={setAspectos} />

          <div className="flex justify-end mt-6">
            <button
              onClick={guardarHoja}
              disabled={saving}
              className="bg-verdeOscuro disabled:opacity-60 text-white px-6 py-1 rounded-lg shadow hover:bg-verdeClaro transition"
            >
              {saving ? "Guardando..." : "Guardar Autoevaluación"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
