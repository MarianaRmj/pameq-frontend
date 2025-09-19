// 📌 Recuento de procesos en el ciclo
export interface RecuentoProceso {
  id: number; // 👈 usar siempre id (es el procesoId real)
  proceso: string;
  oportunidades: number;
}

// 📌 Selección de procesos guardada en BD
export interface SeleccionGuardada {
  id: number;
  proceso: {
    id: number;
    nombre: string;
  };
  seleccionado: boolean;
  observaciones: string;
  usuario_id: number;
}

// 📌 Oportunidades de mejora asociadas a un estándar
export interface OportunidadDTO {
  id: number;
  descripcion: string;
  procesos: { id: number; nombre: string }[];
}

// 📌 Estándares con oportunidades de mejora
export interface EstandarConOportunidad {
  id: number;
  codigo: string;
  descripcion: string;
  oportunidades: OportunidadDTO[];
}
