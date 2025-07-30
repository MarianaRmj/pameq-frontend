import { useState } from "react";

interface CrearEventoModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    titulo: string;
    descripcion: string;
    tipo: string;
    inicio: string;
    fin: string;
  }) => Promise<void>;
}

export function CrearEventoModal({
  open,
  onClose,
  onCreate,
}: CrearEventoModalProps) {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    tipo: "",
    inicio: "",
    fin: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!form.titulo || !form.inicio || !form.fin) {
      setError("Por favor completa todos los campos obligatorios.");
      setSaving(false);
      return;
    }

    try {
      await onCreate(form);
      setForm({
        titulo: "",
        descripcion: "",
        tipo: "actividad",
        inicio: "",
        fin: "",
      });
      onClose();
    } catch {
      setError("Hubo un error al crear el evento.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl border border-verdeSuave animate-fade-in-up relative">
        <button
          className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-xl font-bold text-[#2C5959] mb-4">
          Crear nuevo evento
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Título *</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Descripción
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              rows={2}
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Tipo *</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              required
            >
              <option value="actividad">Actividad</option>
              <option value="reunion">Reunión</option>
              <option value="ciclo">Ciclo</option>
            </select>
          </div>
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl border border-verdeSuave animate-fade-in-up relative">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">
                Fecha inicio *
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={form.inicio}
                onChange={(e) => setForm({ ...form, inicio: e.target.value })}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">
                Fecha fin *
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={form.fin}
                onChange={(e) => setForm({ ...form, fin: e.target.value })}
                required
              />
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#33A691] hover:bg-[#2C5959] text-white font-semibold py-2 px-4 rounded-lg shadow"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
