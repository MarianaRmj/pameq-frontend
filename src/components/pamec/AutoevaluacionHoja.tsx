"use client";

import { useEffect, useState } from "react";
import CalificacionGeneralInput from "./CalificacionGeneralInput";
import CriteriosToggle from "./CriteriosToggle";
import FortalezasTextarea from "./FortalezasTextarea";
import OportunidadesTextarea from "./OportunidadesTextarea";
import { AspectosTable } from "./AspectosTable";
import { api } from "@/app/lib/api";

type Aspecto = { grupo: string; nombre: string; valor?: number | string };
type Estandar = {
  id?: number;
  estandarId?: number;
  grupo: string;
  codigo: string;
  numero: string | number;
  descripcion: string;
  criterios: string[];
  aspectos?: Aspecto[];
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

  // 🚀 Precarga de datos ya guardados (modo edición)
  useEffect(() => {
    if (!estandarId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [calificacion, cualitativa] = await Promise.all([
          api<any>(`/evaluacion/estandares/${estandarId}/calificaciones`),
          api<any>(
            `/evaluacion/estandares/${estandarId}/evaluacion-cualitativa`
          ),
        ]);

        const baseAspectos = (estandar.aspectos || []).map((a) => {
          let valor = "";

          switch (a.nombre) {
            case "SISTEMATICIDAD Y AMPLITUD":
              valor = calificacion?.sistematicidad ?? "";
              break;
            case "PROACTIVIDAD":
              valor = calificacion?.proactividad ?? "";
              break;
            case "CICLOS DE EVALUACIÓN Y MEJORAMIENTO":
              valor = calificacion?.ciclo_evaluacion ?? "";
              break;
            case "DESPLIEGUE A LA INSTITUCIÓN":
              valor = calificacion?.despliegue_institucion ?? "";
              break;
            case "DESPLIEGUE AL CLIENTE INTERNO Y/O EXTERNO":
              valor = calificacion?.despliegue_cliente ?? "";
              break;
            case "PERTINENCIA":
              valor = calificacion?.pertinencia ?? "";
              break;
            case "CONSISTENCIA":
              valor = calificacion?.consistencia ?? "";
              break;
            case "AVANCE A LA MEDICIÓN":
              valor = calificacion?.avance_medicion ?? "";
              break;
            case "TENDENCIA":
              valor = calificacion?.tendencia ?? "";
              break;
            case "COMPARACIÓN":
              valor = calificacion?.comparacion ?? "";
              break;
          }

          return { ...a, valor };
        });

        setAspectos(baseAspectos);

        setFortalezas(
          Array.isArray(cualitativa?.fortalezas)
            ? cualitativa.fortalezas
            : JSON.parse(cualitativa?.fortalezas ?? '[""]')
        );

        setOportunidades(
          Array.isArray(cualitativa?.oportunidades_mejora)
            ? cualitativa.oportunidades_mejora
            : JSON.parse(cualitativa?.oportunidades_mejora ?? '[""]')
        );
      } catch (err) {
        console.error(
          "❌ Error precargando datos del estándar",
          estandarId,
          err
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [estandarId, estandar.aspectos]);

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
      <h2 className="text-2xl font-bold text-verdeOscuro mb-2">
        {estandar.grupo} - {estandar.codigo}
      </h2>
      <h3 className="text-sm text-black font-nunito text-justify mb-4 leading-relaxed">
        Estándar {estandar.numero}: {estandar.descripcion}
      </h3>

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

          <AspectosTable aspectos={aspectos} setAspectos={setAspectos} />

          <div className="flex justify-end mt-6">
            <button
              onClick={guardarHoja}
              disabled={saving}
              className="bg-verdeOscuro disabled:opacity-60 text-white px-8 py-2.5 rounded-lg shadow hover:bg-verdeClaro transition"
            >
              {saving ? "Guardando..." : "Guardar Hoja"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
