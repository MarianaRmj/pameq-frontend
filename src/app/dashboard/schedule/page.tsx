"use client";
import { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import ScheduleTable, {
  ScheduleTask,
} from "@/componentes/schedule/ScheduleTable";
import ModernGanttChart from "@/componentes/schedule/ModernGanttChart";
import { Task } from "gantt-task-react";

// ---- COLORES POR ESTADO ----
function getBarColorByEstado(estado?: string) {
  switch (estado) {
    case "Pendiente":
      return "#F2C14E"; // O usa "#F2C14E" o cualquier amarillo de tu marca
    case "En progreso":
      return "#33A691"; // verdeClaro
    case "Finalizado":
      return "#2C5959"; // verdeOscuro o "#7fca64" si quieres diferenciarlo
    default:
      return "#B8D9C4"; // verdeSuave
  }
}

// ---- MAPEO DE DATOS ----
export function mapToGanttTasks(tasks: ScheduleTask[]): Task[] {
  return tasks.map((t) => ({
    id: String(t.id),
    type: "task",
    name: t.nombre_tarea,
    start: new Date(t.fecha_comienzo),
    end: new Date(t.fecha_fin),
    progress: t.progreso ?? 0,
    dependencies: t.predecesoras
      ? t.predecesoras
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    // Estos campos los pasamos al tooltip:
    estado: t.estado,
    responsable: t.responsable,
    styles: {
      progressColor: getBarColorByEstado(t.estado),
      progressSelectedColor: "#2C5959",
      backgroundColor: getBarColorByEstado(t.estado),
      backgroundSelectedColor: "#2C5959",
    },
    hideChildren: false,
    isDisabled: false,
    displayOrder: t.id,
  }));
}

export default function SchedulePage() {
  const [tasks, setTasks] = useState<ScheduleTask[]>([
    {
      id: 1,
      nombre_tarea: "Tarea inicial",
      descripcion: "Descripción inicial",
      fecha_comienzo: "2025-08-01",
      fecha_fin: "2025-08-05",
      duracion: 5,
      estado: "Pendiente",
      responsable: "Juan Perez",
      progreso: 18,
      observaciones: "",
      predecesoras: "",
    },
    {
      id: 2,
      nombre_tarea: "Actividad de prueba",
      descripcion: "Actividad inicial",
      fecha_comienzo: "2025-08-15",
      fecha_fin: "2025-08-20",
      duracion: 10,
      estado: "En progreso",
      responsable: "Mariana Perez",
      progreso: 50,
      observaciones: "",
      predecesoras: "1",
    },
    {
      id: 3,
      nombre_tarea: "Reunión de prueba",
      descripcion: "Reunión grupo de trabajo",
      fecha_comienzo: "2025-08-22",
      fecha_fin: "2025-08-29",
      duracion: 6,
      estado: "En progreso",
      responsable: "Melisa Perez",
      progreso: 47,
      observaciones: "",
      predecesoras: "",
    },
    {
      id: 4,
      nombre_tarea: "Diseño de prototipo",
      descripcion: "Elaboración del prototipo inicial",
      fecha_comienzo: "2025-08-06",
      fecha_fin: "2025-08-12",
      duracion: 7,
      estado: "Pendiente",
      responsable: "Carlos Díaz",
      progreso: 60,
      observaciones: "",
      predecesoras: "1",
    },
    {
      id: 5,
      nombre_tarea: "Validación técnica",
      descripcion: "Revisión de requerimientos técnicos",
      fecha_comienzo: "2025-08-13",
      fecha_fin: "2025-08-15",
      duracion: 3,
      estado: "Pendiente",
      responsable: "Laura Gómez",
      progreso: 35,
      observaciones: "",
      predecesoras: "4",
    },
    {
      id: 6,
      nombre_tarea: "Pruebas piloto",
      descripcion: "Ejecución de pruebas iniciales",
      fecha_comienzo: "2025-08-16",
      fecha_fin: "2025-08-19",
      duracion: 4,
      estado: "Pendiente",
      responsable: "Santiago López",
      progreso: 13,
      observaciones: "",
      predecesoras: "5",
    },
    {
      id: 7,
      nombre_tarea: "Capacitación equipo",
      descripcion: "Formación para el equipo de trabajo",
      fecha_comienzo: "2025-08-20",
      fecha_fin: "2025-08-22",
      duracion: 3,
      estado: "Pendiente",
      responsable: "Diana Salazar",
      progreso: 20,
      observaciones: "",
      predecesoras: "6",
    },
    {
      id: 8,
      nombre_tarea: "Implementación inicial",
      descripcion: "Despliegue de la solución",
      fecha_comienzo: "2025-08-23",
      fecha_fin: "2025-08-27",
      duracion: 5,
      estado: "Pendiente",
      responsable: "Miguel Torres",
      progreso: 5,
      observaciones: "",
      predecesoras: "7",
    },
    {
      id: 9,
      nombre_tarea: "Evaluación de resultados",
      descripcion: "Análisis de los datos obtenidos",
      fecha_comienzo: "2025-08-28",
      fecha_fin: "2025-08-30",
      duracion: 3,
      estado: "Pendiente",
      responsable: "Andrea Castro",
      progreso: 0,
      observaciones: "",
      predecesoras: "8",
    },
    {
      id: 10,
      nombre_tarea: "Ajustes finales",
      descripcion: "Corrección de observaciones y mejoras",
      fecha_comienzo: "2025-08-31",
      fecha_fin: "2025-09-03",
      duracion: 4,
      estado: "Pendiente",
      responsable: "Valentina Ruiz",
      progreso: 0,
      observaciones: "",
      predecesoras: "9",
    },
    {
      id: 11,
      nombre_tarea: "Entrega al cliente",
      descripcion: "Presentación formal del resultado",
      fecha_comienzo: "2025-09-04",
      fecha_fin: "2025-09-05",
      duracion: 2,
      estado: "Pendiente",
      responsable: "Oscar Molina",
      progreso: 0,
      observaciones: "",
      predecesoras: "10",
    },
    {
      id: 12,
      nombre_tarea: "Soporte post-entrega",
      descripcion: "Atención a incidencias tras la entrega",
      fecha_comienzo: "2025-09-06",
      fecha_fin: "2025-09-12",
      duracion: 7,
      estado: "Pendiente",
      responsable: "Juliana Torres",
      progreso: 0,
      observaciones: "",
      predecesoras: "11",
    },
    {
      id: 13,
      nombre_tarea: "Cierre de proyecto",
      descripcion: "Documentación y cierre administrativo",
      fecha_comienzo: "2025-09-13",
      fecha_fin: "2025-09-15",
      duracion: 3,
      estado: "Pendiente",
      responsable: "Javier Herrera",
      progreso: 0,
      observaciones: "",
      predecesoras: "12",
    },
  ]);

  const [tab, setTab] = useState(0);

  return (
    <div className="bg-white shadow rounded-xl p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-nunito font-bold text-verdeOscuro mb-2">
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
              fontWeight: "bold",
              color: "#2C5959",
              fontFamily: "Nunito, sans-serif",
            }}
          />
          <Tab
            label="Diagrama Gantt"
            sx={{
              fontWeight: "bold",
              color: "#2C5959",
              fontFamily: "Nunito, sans-serif",
            }}
          />
        </Tabs>
      </Box>
      {tab === 0 && (
        <Box>
          <ScheduleTable tasks={tasks} setTasks={setTasks} />
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <div className="text-sm text-gray-500 mb-2">
            Arrastra las barras para ajustar fechas o consulta visualmente el
            progreso de las actividades.
          </div>
          <ModernGanttChart tasks={mapToGanttTasks(tasks)} />
        </Box>
      )}
    </div>
  );
}
