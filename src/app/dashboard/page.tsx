"use client";
import { useEffect, useState } from "react";
import { fetchDashboardSummary } from "../utils/api";

export default function Dashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetchDashboardSummary().then(setSummary);
  }, []);

  if (!summary) return <p>Cargando...</p>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-verdeSuave p-4 text-black">
        ¿Este fondo es verde suave?
      </div>
      <div className="bg-white shadow-md rounded-xl p-4">
        <p className="text-sm font-semibold">Tareas Abiertas</p>
        <h2 className="text-2xl font-bold text-red-600">{summary.openTasks}</h2>
      </div>
      <div className="bg-white shadow-md rounded-xl p-4">
        <p className="text-sm font-semibold">Tareas Completadas</p>
        <h2 className="text-2xl font-bold text-green-600">
          {summary.completedTasks}
        </h2>
      </div>
      {/* y así con las otras métricas... */}
    </div>
  );
}
