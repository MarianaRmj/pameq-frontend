import { ScheduleTask } from "./ScheduleTable";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchTasksByCiclo(
  cicloId: number
): Promise<ScheduleTask[]> {
  const res = await fetch(`${BASE_URL}/schedule-tasks?cicloId=${cicloId}`);
  if (!res.ok) throw new Error("Error cargando tareas");
  return res.json();
}

export async function createTask(
  task: Partial<ScheduleTask>
): Promise<ScheduleTask> {
  const res = await fetch(`${BASE_URL}/schedule-tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Error creando tarea");
  return res.json();
}

export async function updateTask(
  id: number,
  task: Partial<ScheduleTask>
): Promise<ScheduleTask> {
  const res = await fetch(`${BASE_URL}/schedule-tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Error actualizando tarea");
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/schedule-tasks/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error eliminando tarea");
}
