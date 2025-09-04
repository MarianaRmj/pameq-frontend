"use client";

import { useEffect, useState } from "react";
import AutoevaluacionHoja from "@/components/pamec/AutoevaluacionHoja";
import { api } from "@/app/lib/api";

type Estandar = {
  id?: number;
  estandarId?: number;
  grupo: string;
  codigo: string;
  descripcion: string;
  criterios: string[];
};

export default function AutoevaluacionPage() {
  const autoevaluacionId = 1;
  const [estandares, setEstandares] = useState<Estandar[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🧠 Cargar datos desde backend
  useEffect(() => {
    const load = async () => {
      try {
        const data = await api<Estandar[]>(
          `/evaluacion/autoevaluaciones/${autoevaluacionId}/estandares-completo`
        );
        setEstandares(data);
        setCurrentIndex(0); // inicializa siempre en la primera
      } catch (error) {
        console.error("Error cargando estándares:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ⌨️ Soporte para flechas ← →
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIndex, estandares.length]);

  const next = () =>
    setCurrentIndex((prev) => Math.min(prev + 1, estandares.length - 1));
  const prev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  const actual = estandares[currentIndex];

  if (loading) return <p className="p-8">Cargando estándares...</p>;
  if (!estandares.length)
    return <p className="p-8 text-red-600">No hay estándares disponibles.</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 font-nunito">
      {/* 🏷️ TÍTULO PRINCIPAL */}
      <h1 className="text-3xl font-nunito text-verdeOscuro mb-6 text-center">
        Autoevaluación de Estándares
      </h1>

      {/* 📊 Barra de progreso */}
      <div className="mb-6">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-verdeOscuro transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / estandares.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* 🧾 Hoja actual */}
      <AutoevaluacionHoja
        estandar={actual}
        autoevaluacionId={autoevaluacionId}
      />

      {/* 🔘 Botones navegación */}
      <div className="flex justify-between mt-4 max-w-5xl mx-auto px-2">
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          className="bg-verdeOscuro text-white px-4 py-1 rounded-lg hover:bg-verdeClaro disabled:opacity-40"
        >
          Anterior
        </button>

        <button
          onClick={next}
          disabled={currentIndex === estandares.length - 1}
          className="bg-verdeOscuro text-white px-4 py-1 rounded-lg hover:bg-verdeClaro disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
