"use client";

import { useEffect, useState } from "react";
import { UserResponseDto } from "./types";

interface Props {
  user: UserResponseDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: Partial<UserResponseDto>) => void;
  sedes: { id: number; nombre_sede: string }[];
}

export const EditUserModal = ({ user, isOpen, onClose, onSave, sedes }: Props) => {
  const [formState, setFormState] = useState<Partial<UserResponseDto>>({});

  useEffect(() => {
    if (user) {
      setFormState(user);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formState);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-verdeOscuro">Editar Usuario</h2>

        <div className="grid grid-cols-1 gap-4">
          <input
            name="nombre"
            value={formState.nombre || ""}
            onChange={handleChange}
            placeholder="Nombre"
            className="border px-3 py-2 rounded"
          />
          <input
            name="email"
            value={formState.email || ""}
            onChange={handleChange}
            placeholder="Correo electrónico"
            className="border px-3 py-2 rounded"
          />
          <select
            name="rol"
            value={formState.rol || ""}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          >
            <option value="">Seleccionar rol</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="usuario">Usuario</option>
          </select>
          <select
            name="sedeId"
            value={formState.sedeId || ""}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          >
            <option value="">Seleccionar sede</option>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre_sede}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-verdeOscuro text-white hover:bg-verdeClaro"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
