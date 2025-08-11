"use client";

import { useState, useEffect } from "react";
import { SedeDto } from "./SedesTable"; // Asegúrate de importar bien el tipo

interface Props {
  sede: SedeDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (changes: Partial<SedeDto>) => void;
}

export const EditSedeModal = ({ sede, isOpen, onClose, onSave }: Props) => {
  const [form, setForm] = useState({
    nombre_sede: "",
    direccion: "",
    telefono: "",
    nombre_lider: "",
    codigo_habilitacion: "",
  });

  useEffect(() => {
    if (sede && isOpen) {
      setForm({
        nombre_sede: sede.nombre_sede,
        direccion: sede.direccion,
        telefono: sede.telefono,
        nombre_lider: sede.nombre_lider,
        codigo_habilitacion: sede.codigo_habilitacion,
      });
    }
  }, [sede, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  if (!isOpen || !sede) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
      >
        <h3 className="text-lg font-font-nunito mb-4 text-verdeOscuro">Editar Sede</h3>
        <div className="mb-3">
          <label className="block text-sm font-nunito">Nombre sede</label>
          <input
            name="nombre_sede"
            value={form.nombre_sede}
            onChange={handleChange}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-nunito">Dirección</label>
          <input
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-nunito">Teléfono</label>
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-nunito">Nombre líder</label>
          <input
            name="nombre_lider"
            value={form.nombre_lider}
            onChange={handleChange}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-nunito">Código habilitación</label>
          <input
            name="codigo_habilitacion"
            value={form.codigo_habilitacion}
            onChange={handleChange}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-3 py-1 rounded bg-verdeOscuro text-white hover:bg-verdeClaro"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};
