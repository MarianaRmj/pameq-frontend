"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import { Activity, EstadoActividad, Process } from "./types";
import { ActivityForm } from "@/components/activities/ActivityForm";
import { ConfirmDialog } from "@/components/activities/ConfirmDialog";

export default function ActivitiesPage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [procesos, setProcesos] = useState<Process[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [editItem, setEditItem] = useState<Activity | null>(null);
  const [confirmDel, setConfirmDel] = useState<{
    id: number;
    name: string;
  } | null>(null);

  async function load() {
    const [list, procs] = await Promise.all([
      api<Activity[]>("/activities"),
      api<Process[]>("/catalog/processes").catch(() => []),
    ]);
    setItems(list);
    setProcesos(procs);
  }
  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    await api(`/activities/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="p-6 font-nunito">
      {/* Encabezado */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2A5559] tracking-tight">
            Actividades Previas
          </h1>
          <p className="text-sm text-gray-500">{items.length} registradas</p>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="bg-verdeOscuro text-white font-nunito px-2 py-1 rounded hover:bg-verdeClaro transition"
        >
          ➕ Nueva actividad
        </button>
      </div>

      {/* Tabla */}
      <div className="ui-card overflow-hidden">
        {/* Head */}
        <div className="ui-table-head">
          <div className="ui-th">Actividad</div>
          <div className="ui-th">Fechas</div>
          <div className="ui-th">Responsable</div>
          <div className="ui-th">Procesos</div>
          <div className="ui-th text-right">Estado</div>
          <div className="ui-th text-right">Acciones</div>
        </div>

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <div className="text-4xl">🗓️</div>
            <p className="text-sm text-gray-500">
              Aún no hay actividades. Crea la primera.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {items.map((a, idx) => (
              <div
                key={a.id}
                className={`ui-table-row ${
                  idx % 2 ? "bg-white" : "bg-gray-50/40"
                } hover:bg-emerald-50/30`}
              >
                {/* Actividad */}
                <div className="ui-td">
                  <div className="line-clamp-1 font-medium text-[#102626]">
                    {a.nombre_actividad}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {a.lugar || "—"}
                  </div>
                </div>

                {/* Fechas */}
                <div className="ui-td">
                  <div className="text-[13px] font-medium">
                    {fmtDateTime(a.fecha_inicio)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {fmtDateTime(a.fecha_fin)}
                  </div>
                </div>

                {/* Responsable */}
                <div className="ui-td">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    ID #{a.responsableId}
                  </span>
                </div>

                {/* Procesos */}
                <div className="ui-td">
                  {a.procesos_invitados?.length ? (
                    <div className="flex max-w-full flex-wrap gap-1">
                      {a.procesos_invitados.slice(0, 2).map((p) => (
                        <span
                          key={p.id}
                          className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700"
                        >
                          {p.nombre}
                        </span>
                      ))}
                      {a.procesos_invitados.length > 2 && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">
                          +{a.procesos_invitados.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </div>

                {/* Estado */}
                <div className="ui-td text-right">
                  <span className={`ui-badge ${estadoClass(a.estado)}`}>
                    {a.estado}
                  </span>
                </div>

                {/* Acciones */}
                <div className="ui-td flex items-center justify-end gap-1">
                  <button
                    className="ui-btn-ghost"
                    onClick={() => setEditItem(a)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="ui-btn-ghost text-rose-700 hover:bg-rose-50"
                    onClick={() =>
                      setConfirmDel({ id: a.id, name: a.nombre_actividad })
                    }
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                  <button className="ui-btn-ghost" title="Evidencias">
                    📎
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crear */}
      {openCreate && (
        <ActivityForm
          procesos={procesos}
          onClose={() => setOpenCreate(false)}
          onSaved={async () => {
            setOpenCreate(false);
            await load();
          }}
          mode="create"
        />
      )}

      {/* Editar */}
      {editItem && (
        <ActivityForm
          procesos={procesos}
          onClose={() => setEditItem(null)}
          onSaved={async () => {
            setEditItem(null);
            await load();
          }}
          mode="edit"
          initial={editItem}
        />
      )}

      {/* Confirmar eliminar */}
      {confirmDel && (
        <ConfirmDialog
          title="Eliminar actividad"
          description={
            <>
              ¿Seguro que deseas eliminar{" "}
              <span className="font-semibold">{confirmDel.name}</span>? Esta
              acción no se puede deshacer.
            </>
          }
          confirmText="Eliminar"
          variant="danger"
          onCancel={() => setConfirmDel(null)}
          onConfirm={async () => {
            await handleDelete(confirmDel.id);
            setConfirmDel(null);
          }}
        />
      )}
    </div>
  );
}

/* ---- helpers visuales ---- */
function estadoClass(estado: EstadoActividad) {
  switch (estado) {
    case "programada":
      return "ui-badge-success";
    case "en_proceso":
      return "ui-badge-warning";
    case "finalizada":
      return "ui-badge-neutral";
    case "cancelada":
      return "ui-badge-danger";
    default:
      return "ui-badge-neutral";
  }
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
