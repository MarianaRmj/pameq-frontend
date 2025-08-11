"use client";

import { useState, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sede: SedeForm) => void;
  institutionId?: number; // Si quieres asociar directamente a una institución
}

interface SedeForm {
  nombre_sede: string;
  direccion: string;
  telefono: string;
  nombre_lider: string;
  codigo_habilitacion: string;
  institutionId: number;
}

export const CreateSedeModal = ({
  isOpen,
  onClose,
  onSave,
  institutionId,
}: Props) => {
  const [form, setForm] = useState<SedeForm>({
    nombre_sede: "",
    direccion: "",
    telefono: "",
    nombre_lider: "",
    codigo_habilitacion: "",
    institutionId: institutionId || 1, // Default si tienes solo una institución
  });

  useEffect(() => {
    if (isOpen) {
      setForm({
        nombre_sede: "",
        direccion: "",
        telefono: "",
        nombre_lider: "",
        codigo_habilitacion: "",
        institutionId: institutionId || 1,
      });
    }
  }, [isOpen, institutionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
      >
        <h3 className="text-lg font-bold mb-4 text-verdeOscuro">Nueva Sede</h3>
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
        {/* Puedes agregar un select para institutionId si tienes varias instituciones */}
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
            Crear
          </button>
        </div>
      </form>
    </div>
  );
};
