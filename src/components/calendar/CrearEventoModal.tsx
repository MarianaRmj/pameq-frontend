// app/dashboard/schedule/CrearEventoModal.tsx
"use client";

import { useEffect, useState } from "react";

export type CrearEventoModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (form: {
    titulo: string;
    descripcion: string;
    tipo: string;
    inicio: string;
    fin: string;
  }) => Promise<void>;
  editMode?: boolean;
  initialData?: {
    titulo: string;
    descripcion?: string;
    tipo?: string;
    inicio?: Date | string | null;
    fin?: Date | string | null;
  };
};

export function CrearEventoModal({
  open,
  onClose,
  onCreate,
  initialData,
  editMode,
}: CrearEventoModalProps) {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    tipo: "manual",
    inicio: "",
    fin: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toDatetimeLocal(dateStr: string | Date) {
    const d = new Date(dateStr);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  useEffect(() => {
    if (!open) return;
    if (editMode && initialData) {
      setForm({
        titulo: initialData.titulo || "",
        descripcion: initialData.descripcion || "",
        tipo: initialData.tipo || "manual",
        inicio: initialData.inicio ? toDatetimeLocal(initialData.inicio) : "",
        fin: initialData.fin ? toDatetimeLocal(initialData.fin) : "",
      });
    } else {
      setForm({
        titulo: "",
        descripcion: "",
        tipo: "manual",
        inicio: "",
        fin: "",
      });
    }
  }, [open, editMode, initialData]);

  const validate = () => {
    if (!form.titulo || !form.inicio || !form.fin) {
      return "Por favor completa todos los campos obligatorios.";
    }
    const start = new Date(form.inicio);
    const end = new Date(form.fin);
    if (end < start) return "La fecha fin no puede ser anterior a la fecha inicio.";
    return null;
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);

    const msg = validate();
    if (msg) {
      setError(msg);
      setSaving(false);
      return;
    }

    try {
      await onCreate(form);
      if (!editMode) {
        setForm({ titulo: "", descripcion: "", tipo: "seleccione", inicio: "", fin: "" });
      }
      onClose();
    } catch {
      setError("Hubo un error al guardar el evento.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl animate-fade-in-up relative">
        {/* Cerrar */}
        <button
          type="button"
          className="absolute right-3 top-2 rounded-lg px-2 py-1 text-gray-400 transition hover:bg-gray-100 hover:text-red-500"
          onClick={onClose}
          aria-label="Cerrar"
          disabled={saving}
        >
          ×
        </button>

        {/* Título */}
        <h3 className="mb-4 text-xl font-nunito text-[#2C5959]">
          {editMode ? "Editar evento" : "Crear nuevo evento"}
        </h3>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label className="ui-label">Título *</label>
            <input
              type="text"
              className="ui-input"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="ui-label">Descripción</label>
            <textarea
              className="ui-input min-h-[84px] resize-y"
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Opcional"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="ui-label">Tipo *</label>
            <select
              className="ui-input"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              required
            >
              <option value="manual">Manual</option>
              <option value="actividad">Actividad</option>
              <option value="reunion">Reunión</option>
              <option value="ciclo">Ciclo</option>
            </select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="ui-label">Fecha inicio *</label>
              <input
                type="datetime-local"
                className="ui-input"
                value={form.inicio}
                onChange={(e) => setForm({ ...form, inicio: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="ui-label">Fecha fin *</label>
              <input
                type="datetime-local"
                className="ui-input"
                min={form.inicio || undefined}
                value={form.fin}
                onChange={(e) => setForm({ ...form, fin: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Acciones */}
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="ui-btn"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="ui-btn ui-btn-primary"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
