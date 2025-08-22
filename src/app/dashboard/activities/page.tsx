// app/dashboard/activities/page.tsx
"use client";

import { useState } from "react";
import { useActivities } from "@/hooks/useActivities";
import type { Activity } from "./types";
import { ActivitiesTable } from "@/components/activities/ActivitiesTable";
import { ActivityForm } from "@/components/activities/ActivityForm";
import { ConfirmDialog } from "@/components/activities/ConfirmDialog";
import { EvidenceListModal } from "@/components/activities/EvidenceListModal";
import { EvidenceUpload } from "@/components/activities/EvidenceUpload";
import { useAuth } from "@/context/AuthContext";

export default function ActivitiesPage() {
  const { items, procesos, loading, load, remove } = useActivities();
  const { user: usuarioAutenticado } = useAuth();

  const [openCreate, setOpenCreate] = useState(false);
  const [editItem, setEditItem] = useState<Activity | null>(null);
  const [confirmDel, setConfirmDel] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [openUploadFor, setOpenUploadFor] = useState<number | null>(null);
  const [openListFor, setOpenListFor] = useState<number | null>(null);

  return (
    <div className="p-6 font-nunito">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-nunito text-[#2A5559] tracking-tight">
            Actividades Previas
          </h1>
          <p className="text-sm text-gray-500">
            {loading ? "Cargando…" : `${items.length} registradas`}
          </p>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="bg-verdeOscuro text-white px-2 py-1 rounded hover:bg-verdeClaro transition"
        >
          ➕ Nueva actividad
        </button>
      </div>

      <ActivitiesTable
        items={items}
        onEdit={(a) => setEditItem(a)}
        onDelete={(a) => setConfirmDel({ id: a.id, name: a.nombre_actividad })}
        onOpenUpload={(a) => setOpenUploadFor(a.id)}
        onOpenList={(a) => setOpenListFor(a.id)}
      />

      {openCreate && usuarioAutenticado && (
        <ActivityForm
          userId={usuarioAutenticado.id}
          procesos={procesos}
          onClose={() => setOpenCreate(false)}
          onSaved={async () => {
            setOpenCreate(false);
            await load();
          }}
          mode="create"
        />
      )}

      {editItem && usuarioAutenticado && (
        <ActivityForm
          userId={usuarioAutenticado.id}
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

      {confirmDel && (
        <ConfirmDialog
          title="Eliminar actividad"
          description={
            <>
              ¿Eliminar <span className="font-nunito">{confirmDel.name}</span>
              ? Esta acción no se puede deshacer.
            </>
          }
          confirmText="Eliminar"
          variant="danger"
          onCancel={() => setConfirmDel(null)}
          onConfirm={async () => {
            await remove(confirmDel.id);
            setConfirmDel(null);
          }}
        />
      )}

      {openUploadFor !== null && (
        <EvidenceUpload
          activityId={openUploadFor}
          onUploaded={load}
          onClose={() => setOpenUploadFor(null)}
        />
      )}

      {openListFor !== null && (
        <EvidenceListModal
          activityId={openListFor}
          onClose={() => setOpenListFor(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}
