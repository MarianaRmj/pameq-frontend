"use client";
import { useState, useEffect } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import ScheduleTable, {
  ScheduleTask,
} from "@/components/schedule/ScheduleTable";
import ModernGanttChart from "@/components/schedule/ModernGanttChart";
import { Task } from "gantt-task-react";
import dayjs from "dayjs";

// Importa tu función fetch
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchTasksByCiclo(cicloId: number): Promise<ScheduleTask[]> {
  const res = await fetch(`${BASE_URL}/schedule-tasks?cicloId=${cicloId}`);
  if (!res.ok) throw new Error("Error cargando tareas");
  return res.json();
}

// ---- COLORES POR ESTADO ----
// Cambia el umbral si quieres (en días)
const WARNING_DAYS = 3;

// Solo keys que acepta gantt-task-react
function getBarStylesByEstado(estado?: string, fechaFin?: string) {
  const st = (estado ?? "").toLowerCase().replace("_", " "); // "en_curso" -> "en curso"
  const end = fechaFin ? dayjs(fechaFin) : null;

  // 1) Completadas -> VERDE
  if (st === "finalizado" || st === "finalizada" || st === "finalizado/a") {
    return {
      backgroundColor: "#2C5959",
      backgroundSelectedColor: "#1E4545",
      progressColor: "#B8D9C4",
      progressSelectedColor: "#A2CDB3",
    };
  }

  // 2) Fechas (si hay fecha_fin)
  if (end) {
    const daysLeft = end.diff(dayjs(), "day"); // negativo: vencida

    // Vencida -> ROJO
    if (daysLeft < 0) {
      return {
        backgroundColor: "#D14343",
        backgroundSelectedColor: "#B23838",
        progressColor: "#FDE2E2",
        progressSelectedColor: "#F9CACA",
      };
    }

    // Próxima a vencer -> ÁMBAR/NARANJA
    if (daysLeft <= WARNING_DAYS) {
      return {
        backgroundColor: "#F59E0B", // naranja (puedes usar "#F2C14E" si prefieres)
        backgroundSelectedColor: "#D48806",
        progressColor: "#7A4E03",
        progressSelectedColor: "#623E02",
      };
    }
  }

  // 3) En progreso (normal) -> TURQUESA
  if (st === "en curso" || st === "en progreso") {
    return {
      backgroundColor: "#33A691",
      backgroundSelectedColor: "#2A8C7A",
      progressColor: "#16796B",
      progressSelectedColor: "#126559",
    };
  }

  // 4) Pendiente (lejos del vencimiento) -> ámbar suave
  return {
    backgroundColor: "#F2C14E",
    backgroundSelectedColor: "#D9A83C",
    progressColor: "#8F6A1F",
    progressSelectedColor: "#7A591A",
  };
}

// ---- MAPEO DE DATOS (reemplaza tu función actual) ----
export function mapToGanttTasks(tasks: ScheduleTask[]): Task[] {
  return tasks
    .filter((t) => t.nombre_tarea && t.fecha_comienzo && t.fecha_fin)
    .map((t) => {
      const deps =
        typeof t.predecesoras === "string"
          ? t.predecesoras
              .split(",")
              .map((s) => s.trim())
              .map((s) => s.match(/^\d+/)?.[0])
              .filter(Boolean)
          : [];

      return {
        id: String(t.id),
        type: t.parentId ? "task" : "project",
        name: t.nombre_tarea,
        start: new Date(t.fecha_comienzo),
        end: new Date(t.fecha_fin),
        progress: t.progreso ?? 0,
        dependencies: deps as string[],
        project: t.parentId ? String(t.parentId) : undefined,
        estado: t.estado,
        responsable: t.responsable,
        // ⬇️ Colores dinámicos por fecha/estado
        styles: getBarStylesByEstado(t.estado, t.fecha_fin),
        hideChildren: false,
        isDisabled: false,
        displayOrder: t.id,
      } as Task;
    });
}

export default function SchedulePage() {
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cicloId] = useState<number>(1); // Solo una vez!

  useEffect(() => {
    setLoading(true);
    fetchTasksByCiclo(cicloId)
      .then(setTasks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [cicloId]);

  return (
    <div className="bg-white shadow rounded-xl p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-nunito text-verdeOscuro mb-2">
        Cronograma de Actividades
      </h2>
      <p className="mb-4 text-negro font-nunito">
        Visualiza, crea y administra las actividades del cronograma
        institucional.
      </p>
      <Box sx={{ borderBottom: 1, borderColor: "#2C5959", mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab
            label="Tabla"
            sx={{
              fontWeight: "nunito",
              color: "#2C5959",
              fontFamily: "Nunito, sans-serif",
            }}
          />
          <Tab
            label="Diagrama Gantt"
            sx={{
              fontWeight: "nunito",
              color: "#2C5959",
              fontFamily: "Nunito, sans-serif",
            }}
          />
        </Tabs>
      </Box>
      {tab === 0 && (
        <Box>
          <ScheduleTable tasks={tasks} setTasks={setTasks} cicloId={cicloId} />
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <ModernGanttChart
            tasks={mapToGanttTasks(tasks)}
            cicloId={String(cicloId)}
          />
        </Box>
      )}
      {loading && <div className="text-center mt-4">Cargando tareas...</div>}
      {error && <div className="text-center mt-4 text-red-600">{error}</div>}
    </div>
  );
}
