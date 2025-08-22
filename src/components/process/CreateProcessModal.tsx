"use client";

import { useState, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (procesos: ProcessForm) => void;
  institutionId?: number;
}

export interface ProcessForm {
  nombre_proceso: string;
  descripcion: string;
  lider: string;
  numero_integrantes: string;
  indicadores: { nombre: string }[];
  institutionId: number;
}

export const CreateProcessModal = ({
  isOpen,
  onClose,
  onSave,
  institutionId,
}: Props) => {
  const [form, setForm] = useState<ProcessForm>({
    nombre_proceso: "",
    descripcion: "",
    lider: "",
    numero_integrantes: "",
    indicadores: [],
    institutionId: institutionId || 1,
  });

  const [newIndicator, setNewIndicator] = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm({
        nombre_proceso: "",
        descripcion: "",
        lider: "",
        numero_integrantes: "",
        indicadores: [],
        institutionId: institutionId || 1,
      });
      setNewIndicator("");
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
        <h3 className="text-lg font-nunito mb-4 text-verdeOscuro">
          Nuevo Proceso
        </h3>

        <div className="mb-3">
          <label className="block text-sm font-nunito">Nombre</label>
          <input
            name="nombre_proceso"
            value={form.nombre_proceso}
            onChange={handleChange}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-nunito">Descripción</label>
          <input
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-nunito">Líder</label>
          <input
            name="lider"
            value={form.lider}
            onChange={handleChange}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-nunito">Integrantes</label>
          <input
            name="numero_integrantes"
            value={form.numero_integrantes}
            onChange={handleChange}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-nunito">Indicadores</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Nuevo indicador"
              className="w-full border rounded px-2 py-1"
              value={newIndicator}
              onChange={(e) => setNewIndicator(e.target.value)}
            />
            <button
              type="button"
               className="px-1 pl-1 rounded bg-verdeOscuro text-white hover:bg-verdeClaro"
              onClick={() => {
                if (newIndicator.trim() !== "") {
                  setForm({
                    ...form,
                    indicadores: [
                      ...form.indicadores,
                      { nombre: newIndicator.trim() },
                    ],
                  });
                  setNewIndicator("");
                }
              }}
            >
              Agregar
            </button>
          </div>
          <ul className="list-disc pl-4 text-sm text-gray-700">
            {form.indicadores.map((i, idx) => (
              <li key={idx} className="flex justify-between items-center">
                {i.nombre}
                <button
                  type="button"
                  className="text-red-500 text-xs ml-2"
                  onClick={() => {
                    setForm({
                      ...form,
                      indicadores: form.indicadores.filter(
                        (_, i2) => i2 !== idx
                      ),
                    });
                  }}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
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
            Crear
          </button>
        </div>
      </form>
    </div>
  );
};
