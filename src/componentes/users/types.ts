export type RolUsuario = "admin" | "coordinador" | "evaluador" | "usuario" | "editor";

export interface UserResponseDto {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  sedeId: number | null;
  sedeNombre?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
  sedeId?: number;
}
