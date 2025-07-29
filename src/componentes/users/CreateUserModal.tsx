"use client";

import { useState } from "react";
import { CreateUserDto, RolUsuario } from "./types";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nuevo: CreateUserDto) => void;
  sedes: { id: number; nombre_sede: string }[];
  roles: RolUsuario[];
}

export const CreateUserModal = ({
  isOpen,
  onClose,
  onSave,
  sedes,
  roles,
}: CreateUserModalProps) => {
  const [formData, setFormData] = useState<CreateUserDto>({
    nombre: "",
    email: "",
    password: "",
    rol: roles[0],
    sedeId: undefined,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "sedeId" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      nombre: "",
      email: "",
      password: "",
      rol: roles[0],
      sedeId: undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-xl w-[400px]"
      >
        <h2 className="text-xl font-bold mb-4 text-verdeOscuro">
          Crear Nuevo Usuario
        </h2>
        <div className="mb-2">
          <label className="block text-sm font-semibold">Nombre</label>
          <input
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full border rounded px-3 py-1 mt-1"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-semibold">Email</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-1 mt-1"
            type="email"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-semibold">Contraseña</label>
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded px-3 py-1 mt-1"
            type="password"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-semibold">Rol</label>
          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            className="w-full border rounded px-3 py-1 mt-1"
            required
          >
            <option value="">-- Selecciona un rol --</option>
            {roles.map((rol) => (
              <option key={rol} value={rol}>
                {rol}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold">Sede</label>
          <select
            name="sedeId"
            value={formData.sedeId || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-1 mt-1"
          >
            <option value="">-- Selecciona una sede --</option>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre_sede}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-verdeOscuro text-white rounded hover:bg-verdeClaro"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};
