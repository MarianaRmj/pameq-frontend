"use client";

import { useEffect, useState } from "react";
import AutoevaluacionHoja from "@/components/pamec/AutoevaluacionHoja";
import { api } from "@/app/lib/api";

export default function AutoevaluacionPage() {
  const autoevaluacionId = 1; // Temporal
  const [estandares, setEstandares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await api<any[]>(
          `/evaluacion/autoevaluaciones/${autoevaluacionId}/estandares-completo`
        );
        console.log("📦 Estandares recibidos:", data);
        setEstandares(data);
      } catch (e: any) {
        console.error("❌ Error al cargar estándares:", e);
        setError("No fue posible cargar los estándares.");
      } finally {
        setLoading(false);
      }
    })();
  }, [autoevaluacionId]);

  return (
    <div className="py-4 px-2 max-w-6xl mx-auto">
      <h1 className="text-3xl font-nunito text-verdeOscuro mb-2">
        Autoevaluación por Estándares
      </h1>

      <p className="text-gray-700 font-nunito mb-6">
        A continuación se presenta una hoja por cada estándar con sus
        respectivos criterios y aspectos a calificar.
      </p>

      {loading && <p className="text-gray-500">Cargando estándares...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading &&
        !error &&
        estandares.map((est: any) => (

          <AutoevaluacionHoja
            key={est.id ?? est.estandarId}
            estandar={est}
            autoevaluacionId={autoevaluacionId}
          />
        ))}
    </div>
  );
}
