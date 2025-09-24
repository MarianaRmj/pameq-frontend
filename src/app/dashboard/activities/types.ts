// app/dashboard/activities/types.ts
export type EstadoActividad =
  | "programada"
  | "en_proceso"
  | "finalizada"
  | "cancelada";

export interface Process {
  id: number;
  nombre_proceso: string;
  descripcion?: string;
  lider?: string;
  numero_integrantes?: number;
}

export interface Evidence {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploaded_at: string;
}

export interface Activity {
  id: number;
  nombre_actividad: string;
  descripcion?: string;
  fecha_inicio: string; // ISO
  fecha_fin: string; // ISO
  lugar?: string;
  estado: EstadoActividad;
  institutionId: number;
  sedeId?: number;
  cicloId?: number;
  responsable?: { id: number; nombre: string; email?: string }; // 👈
  procesos: Process[];
  evidencias: Evidence[];
  created_at: string;
  updated_at: string;
}
