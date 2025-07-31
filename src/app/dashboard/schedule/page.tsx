"use client";

import React from "react";
import ScheduleTable from "@/componentes/schedule/ScheduleTable";

export default function SchedulePage() {
  return (
    <div className="bg-white shadow rounded-xl p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-nunito font-bold text-verdeOscuro">
          Cronograma de Actividades
        </h2>
      </div>
      <p className="mb-4 text-negro font-nunito">
        Visualiza, crea y administra las actividades del cronograma
        institucional.
      </p>

      {/* Contenedor del DataGrid */}
      <div style={{ width: "100%"}}>
        <ScheduleTable />
      </div>
    </div>
  );
}
