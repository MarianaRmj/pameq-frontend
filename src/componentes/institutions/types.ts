export interface InstitutionForm {
  id?: number;
  nombre_ips: string;
  nit: string;
  direccion_principal: string;
  telefono: string;
  codigo_habilitacion: string;
  tipo_institucion: string;
  nombre_representante: string;
  nivel_complejidad: string;
  correo_contacto: string;
  enfoque: string;
}

export interface CicloForm {
  id?: number;
  fecha_inicio: string;
  fecha_fin: string;
  enfoque: string;
  sedeId?: number;
  estado: "activo" | "finalizado" | "en_proceso";
  observaciones: string;
  institutionId: number;
  sede?: { id: number };
}
