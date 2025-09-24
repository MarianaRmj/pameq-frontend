"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import {
  Process,
  EstadoActividad,
  Activity,
} from "@/app/dashboard/activities/types";
import { useAuth } from "@/context/AuthContext";

type Props = {
  userId: number;
  procesos: Process[];
  onClose: () => void;
  onSaved: () => Promise<void>;
  mode?: "create" | "edit";
  initial?: Activity | null;
};

function toInputDT(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60_000);
  return local.toISOString().slice(0, 16);
}

export function ActivityForm({
  onClose,
  onSaved,
  mode = "create",
  initial = null,
}: Props) {
  const [form, setForm] = useState({
    nombre_actividad: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    lugar: "",
    estado: "programada" as EstadoActividad,
    institutionId: 1,
    sedeId: undefined as number | undefined,
    cicloId: undefined as number | undefined,
    responsableId: 1,
    procesosIds: [] as number[], // 👈 procesos múltiples
  });

  const [formOptions, setFormOptions] = useState<{
    sedes: { id: number; nombre_sede: string }[];
    responsables: { id: number; nombre: string; email: string }[];
    procesos: Process[];
    institution: { id: number; nombre: string };
    ciclo?: { id: number; fecha_inicio: string };
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const userId = user?.id;

  // Prefill cuando es edición
  useEffect(() => {
    if (!initial) return;
    setForm({
      nombre_actividad: initial.nombre_actividad ?? "",
      descripcion: initial.descripcion ?? "",
      fecha_inicio: toInputDT(initial.fecha_inicio),
      fecha_fin: toInputDT(initial.fecha_fin),
      lugar: initial.lugar ?? "",
      estado: initial.estado,
      institutionId: initial.institutionId,
      sedeId: initial.sedeId,
      cicloId: initial.cicloId,
      responsableId: initial.responsable?.id ?? 1, // 👈 solo el ID
      procesosIds: initial.procesos?.map((p) => p.id) ?? [],
    });
  }, [initial]);

  // Fetch form options cuando se crea
  // Fetch form options en create y edit
  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ userId no definido:", user);
      return;
    }
    async function fetchFormOptions() {
      try {
        const res = await fetch(
          `http://localhost:3001/activities/form-options?userId=${String(
            userId
          )}`
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error ${res.status}: ${text}`);
        }

        const data = await res.json();
        setFormOptions(data);

        // Solo autocompletar valores por defecto en "create"
        if (mode === "create") {
          setForm((prev) => ({
            ...prev,
            institutionId: data.institution.id,
            cicloId: data.ciclo?.id,
            responsableId: data.responsables[0]?.id ?? 1,
          }));
        }
      } catch (err) {
        console.error("❌ Error cargando opciones del formulario:", err);
      }
    }

    fetchFormOptions();
  }, [mode, userId, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form };
      // Optionally, if your backend expects "procesos" instead of "procesosIds", map accordingly:
      // payload.procesos = form.procesosIds;
      if (mode === "edit" && initial) {
        await api(`/activities/${initial.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/activities", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      await onSaved();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Error guardando la actividad");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-2xl ring-1 ring-gray-200 font-nunito">
        <div className="flex items-center justify-between border-b border-gray-200/70 px-6 py-4">
          <h2 className="text-lg font-nunito text-[#2A5559] tracking-tight">
            {mode === "edit" ? "Editar actividad" : "Nueva actividad"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form
          id="activityForm"
          onSubmit={handleSubmit}
          className="max-h-[72vh] overflow-y-auto px-6 py-5 space-y-5"
        >
          <Section title="Básicos">
            <div className="grid grid-cols-12 gap-4">
              <Field
                className="col-span-12"
                label="Nombre de la actividad"
                required
              >
                <input
                  className="ui-input"
                  value={form.nombre_actividad}
                  onChange={(e) =>
                    setForm({ ...form, nombre_actividad: e.target.value })
                  }
                  placeholder="Ej. Socialización de mejoras PAMEQ"
                  required
                />
              </Field>

              <Field className="col-span-12" label="Descripción">
                <textarea
                  className="ui-input min-h-[96px] resize-y"
                  rows={4}
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                  placeholder="Objetivo, alcance, metodología…"
                />
              </Field>
            </div>
          </Section>

          <Section title="Programación">
            <div className="grid grid-cols-12 gap-4">
              <Field
                className="col-span-12 md:col-span-6"
                label="Fecha inicio"
                required
              >
                <input
                  type="datetime-local"
                  className="ui-input"
                  value={form.fecha_inicio}
                  onChange={(e) =>
                    setForm({ ...form, fecha_inicio: e.target.value })
                  }
                  required
                />
              </Field>

              <Field
                className="col-span-12 md:col-span-6"
                label="Fecha fin"
                required
              >
                <input
                  type="datetime-local"
                  className="ui-input"
                  value={form.fecha_fin}
                  onChange={(e) =>
                    setForm({ ...form, fecha_fin: e.target.value })
                  }
                  required
                />
              </Field>

              <Field className="col-span-12 md:col-span-6" label="Lugar">
                <input
                  className="ui-input"
                  value={form.lugar ?? ""}
                  onChange={(e) => setForm({ ...form, lugar: e.target.value })}
                  placeholder="Auditorio principal / Sala 2 / Virtual"
                />
              </Field>
            </div>
          </Section>

          <Section title="Contexto">
            <div className="grid grid-cols-12 gap-4">
              <Field className="col-span-12 md:col-span-4" label="Institución">
                <input
                  className="ui-input"
                  value={formOptions?.institution?.nombre ?? ""}
                  disabled
                />
              </Field>

              <Field className="col-span-12 md:col-span-4" label="Sede">
                <select
                  className="ui-input"
                  value={form.sedeId ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sedeId: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                >
                  <option value="">Seleccione una sede</option>
                  {formOptions?.sedes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre_sede}
                    </option>
                  ))}
                </select>
              </Field>

              <Field className="col-span-12 md:col-span-4" label="Ciclo">
                <input
                  className="ui-input"
                  value={form.cicloId ?? ""}
                  disabled
                />
              </Field>
            </div>
          </Section>

          <Section title="Participantes">
            <div className="grid grid-cols-12 gap-4">
              <Field
                className="col-span-12 md:col-span-6"
                label="Responsable"
                required
              >
                <select
                  name="responsableId"
                  value={form.responsableId}
                  onChange={(e) =>
                    setForm({ ...form, responsableId: Number(e.target.value) })
                  }
                  className="ui-input"
                >
                  <option value="">Seleccione un responsable</option>
                  {formOptions?.responsables?.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                className="col-span-12 md:col-span-6"
                label="Procesos"
                required
              >
                <div className="space-y-2">
                  {formOptions?.procesos?.map((p) => (
                    <label key={p.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-[#2C5959] focus:ring-[#2C5959]"
                        checked={form.procesosIds.includes(p.id)}
                        onChange={(e) => {
                          setForm((prev) => ({
                            ...prev,
                            procesosIds: e.target.checked
                              ? [...prev.procesosIds, p.id]
                              : prev.procesosIds.filter((id) => id !== p.id),
                          }));
                        }}
                      />
                      <span className="text-sm">{p.nombre_proceso}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>
          </Section>

          <Section title="Estado">
            <div className="grid grid-cols-12 gap-4">
              <Field className="col-span-12 md:col-span-4" label="Estado">
                <select
                  className="ui-input"
                  value={form.estado}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      estado: e.target.value as EstadoActividad,
                    })
                  }
                >
                  <option value="programada">programada</option>
                  <option value="en_proceso">en_proceso</option>
                  <option value="finalizada">finalizada</option>
                  <option value="cancelada">cancelada</option>
                </select>
              </Field>
            </div>
          </Section>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </form>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200/70 bg-white/70 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-2xl border border-gray-300 px-4 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            form="activityForm"
            type="submit"
            disabled={saving}
            className="h-10 rounded-2xl bg-[#2C5959] px-5 text-sm font-medium text-white shadow hover:opacity-95 disabled:opacity-70 transition"
          >
            {saving
              ? mode === "edit"
                ? "Actualizando…"
                : "Guardando…"
              : mode === "edit"
              ? "Guardar cambios"
              : "Guardar actividad"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-xl border border-gray-200/70 bg-white/60 p-4 shadow-sm">
      <legend className="px-2 text-xs font-nunito uppercase tracking-wide text-[#2A5559]">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="ui-label">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
    </div>
  );
}
