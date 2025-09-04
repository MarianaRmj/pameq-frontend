"use client";

import { useEffect, useState, useRef } from "react";
import CalificacionGeneralInput from "./CalificacionGeneralInput";
import CriteriosToggle from "./CriteriosToggle";
import FortalezasTextarea from "./FortalezasTextarea";
import OportunidadesTextarea from "./OportunidadesTextarea";
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
  criterios: string[]; // ← array
};

export default function AutoevaluacionHoja({
  estandar,
  autoevaluacionId,
}: {
  estandar: Estandar;
  autoevaluacionId: number;
}) {
  const estandarId = estandar.id ?? estandar.estandarId;
  const [aspectos, setAspectos] = useState<Aspecto[]>([]);
  const [fortalezas, setFortalezas] = useState<string[]>([""]);
  const [oportunidades, setOportunidades] = useState<string[]>([""]);
  const [mostrarCriterios, setMostrarCriterios] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const uploadingRef = useRef(false);

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
          {
            method: "POST",
            body: formData,
          }
        );

        const text = await res.text();
        console.log("🔍 Respuesta cruda del backend:", text);

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

  // 🚀 Precarga de datos ya guardados (modo edición)
  useEffect(() => {
    if (!estandar) return;
    setAspectos([
      { nombre: "SISTEMATICIDAD Y AMPLITUD", valor: "", grupo: estandar.grupo },
      { nombre: "PROACTIVIDAD", valor: "", grupo: estandar.grupo },
      {
        nombre: "CICLOS DE EVALUACIÓN Y MEJORAMIENTO",
        valor: "",
        grupo: estandar.grupo,
      },
      {
        nombre: "DESPLIEGUE A LA INSTITUCIÓN",
        valor: "",
        grupo: estandar.grupo,
      },
      {
        nombre: "DESPLIEGUE AL CLIENTE INTERNO Y/O EXTERNO",
        valor: "",
        grupo: estandar.grupo,
      },
      { nombre: "PERTINENCIA", valor: "", grupo: estandar.grupo },
      { nombre: "CONSISTENCIA", valor: "", grupo: estandar.grupo },
      { nombre: "AVANCE A LA MEDICIÓN", valor: "", grupo: estandar.grupo },
      { nombre: "TENDENCIA", valor: "", grupo: estandar.grupo },
      { nombre: "COMPARACIÓN", valor: "", grupo: estandar.grupo },
    ]);
    setLoading(false);
  }, [estandar]);

  useEffect(() => {
    const cargarEvidencias = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/evidencia-fortaleza/estandares/${estandarId}/evidencias-fortalezas`
        );
        const data = await res.json();

        if (Array.isArray(data)) {
          const precargadas = data.map((ev: Evidencia) => ({
            id: ev.id,
            nombre: ev.nombre_archivo ?? "",
            url: ev.url_archivo ?? "",
            fecha_carga: ev.fecha_carga ?? "",
          }));
          setEvidencias(precargadas);
        }
      } catch (error) {
        console.error("❌ Error cargando evidencias previas:", error);
      }
    };

    cargarEvidencias();
  }, [autoevaluacionId, estandarId]);

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

  const guardarHoja = async () => {
    if (!estandarId) {
      alert("No se encontró el ID del estándar.");
      return;
    }
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
      <h2 className="text-2xl font-nunito text-verdeOscuro  mb-2">
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

          <FortalezasTextarea
            fortalezas={fortalezas}
            setFortalezas={setFortalezas}
          />

          <OportunidadesTextarea
            oportunidades={oportunidades}
            setOportunidades={setOportunidades}
          />

          {/* 📎 Subir evidencias de fortalezas */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Evidencias de fortalezas (PDF, Word, Imágenes)
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-verdeClaro file:text-white hover:file:bg-verdeOscuro"
              onChange={(e) => subirEvidencias(e.target.files)}
            />

            {/* Mostrar archivos ya subidos */}
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
                        const confirmar = confirm(
                          "¿Deseas eliminar esta evidencia?"
                        );
                        if (!confirmar) return;

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
              {saving ? "Guardando..." : "Guardar Hoja"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
