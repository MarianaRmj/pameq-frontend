"use client";
import GanttChart from "@/componentes/schedule/GanttChart";

const testTasks = [
  {
    id: 1,
    name: "Tarea de prueba",
    start: "2025-08-01",
    end: "2025-08-03",
    progress: 50,
    dependencies: "",
  },
];

export default function TestGanttPage() {
  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", background: "#f9f9f9", borderRadius: 12, padding: 32 }}>
      <h2 style={{ fontWeight: 700, color: "#2C5959", marginBottom: 24 }}>
        Test de Diagrama Gantt
      </h2>
      <GanttChart tasks={testTasks} />
    </div>
  );
}
