export interface UserResponseDto {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  sedeId: number | null;
  sedeNombre?: string;
  created_at: string;
  updated_at: string;
}
