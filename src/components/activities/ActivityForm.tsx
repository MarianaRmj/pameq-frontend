"use client";

import { useEffect, useMemo, useState } from "react";
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
  procesos,
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
    procesosIds: [] as number[],
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
  const [searchProc, setSearchProc] = useState("");
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
      responsableId: initial.responsableId,
      procesosIds: initial.procesos_invitados?.map((p) => p.id) ?? [],
    });
  }, [initial]);

  // Fetch form options cuando se crea
  useEffect(() => {
    if (mode !== "create") return;
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

        setForm((prev) => ({
          ...prev,
          institutionId: data.institution.id,
          cicloId: data.ciclo?.id,
          responsableId: data.responsables[0]?.id ?? 1,
        }));
      } catch (err) {
        console.error("❌ Error cargando opciones del formulario:", err);
      }
    }

    fetchFormOptions();
  }, [mode, userId, user]);

  const filteredProcesos = useMemo(() => {
    const q = searchProc.trim().toLowerCase();
    if (!q) return procesos;
    return procesos.filter((p) => p.nombre.toLowerCase().includes(q));
  }, [procesos, searchProc]);

  const toggleProceso = (id: number) => {
    setForm((f) =>
      f.procesosIds.includes(id)
        ? { ...f, procesosIds: f.procesosIds.filter((x) => x !== id) }
        : { ...f, procesosIds: [...f.procesosIds, id] }
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form };
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
          <h2 className="text-lg font-semibold text-[#2A5559] tracking-tight">
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
                  className="ui-input"
                  value={form.responsableId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      responsableId: Number(e.target.value),
                    })
                  }
                  required
                >
                  {formOptions?.responsables.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} ({r.email})
                    </option>
                  ))}
                </select>
              </Field>

              <div className="col-span-12 md:col-span-6">
                <label className="ui-label">Procesos invitados</label>
                <div className="ui-input flex flex-col gap-2">
                  <input
                    className="h-9 w-full rounded-lg border border-transparent bg-white px-2 text-sm outline-none placeholder:text-gray-400"
                    placeholder="Buscar proceso…"
                    value={searchProc}
                    onChange={(e) => setSearchProc(e.target.value)}
                  />

                  <div className="max-h-36 overflow-y-auto rounded-md border border-gray-200/80 bg-white/70 backdrop-blur-sm divide-y divide-gray-100">
                    {filteredProcesos.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        Sin resultados
                      </div>
                    ) : (
                      filteredProcesos.map((p) => {
                        const checked = form.procesosIds.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition ${
                              checked ? "bg-[#eaf8f2]" : "hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleProceso(p.id)}
                              className="accent-[#2C5959]"
                            />
                            <span className="truncate">{p.nombre}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
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
      <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-[#2A5559]">
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
