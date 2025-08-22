"use client";
import type {
  Activity,
  EstadoActividad,
} from "@/app/dashboard/activities/types";

export function ActivitiesTable({
  items,
  onEdit,
  onDelete,
  onOpenUpload,
  onOpenList,
}: {
  items: Activity[];
  onEdit: (a: Activity) => void;
  onDelete: (a: Activity) => void;
  onOpenUpload: (a: Activity) => void;
  onOpenList: (a: Activity) => void;
}) {
  // MISMA plantilla para head y filas → columnas alineadas
  const COLS = "grid grid-cols-[2fr_2fr_2fr_2fr_2fr_2fr_2fr] gap-x-1";
  // MISMO padding por celda
  const CELL = "gap-x-2 px-2 py-2";

  return (
    <div className="ui-card overflow-hidden rounded-1xl border border-gray-200 bg-white shadow-sm">
      {/* Head */}
      <div className={`${COLS} bg-verdeOscuro/95 text-white`}>
        <div
          className={`ui-th p-0${CELL} text-[11px] font-nunito uppercase tracking-wide`}
        >
          Actividad
        </div>
        <div
          className={`ui-th p-0 ${CELL} text-[11px] font-nunito uppercase tracking-wide`}
        >
          Fechas
        </div>
        <div
          className={`ui-th p-0 ${CELL} text-[11px] font-nunito uppercase tracking-wide`}
        >
          Responsable
        </div>
        <div
          className={`ui-th p-0 ${CELL} text-[11px] font-nunito uppercase tracking-wide`}
        >
          Procesos
        </div>
        <div
          className={`ui-th p-0 ${CELL} text-center text-[11px] font-nunito uppercase tracking-wide`}
        >
          Evidencias
        </div>
        <div
          className={`ui-th p-0 ${CELL} text-right text-[11px] font-nunito uppercase tracking-wide`}
        >
          Estado
        </div>
        <div
          className={`ui-th p-0 ${CELL} text-right text-[11px] font-nunito uppercase tracking-wide`}
        >
          Acciones
        </div>
      </div>

      {/* Body */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-8 py-16 text-center">
          <div className="text-4xl">🗓️</div>
          <p className="text-sm text-gray-500">
            Aún no hay actividades. Crea la primera.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((a, idx) => (
            <div
              key={a.id}
              className={`${COLS} items-center leading-relaxed ${
                idx % 2 ? "bg-white" : "bg-gray-50/60"
              } hover:bg-emerald-50/40`}
            >
              {/* Actividad */}
              <div className={`ui-td p-0 ${CELL}`}>
                <div className="line-clamp-1 text-[15px] font-nunito text-[#102626]">
                  {a.nombre_actividad}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {a.lugar || "—"}
                </div>
              </div>

              {/* Fechas */}
              <div className={`ui-td p-0 ${CELL}`}>
                <div className="text-[13px] font-medium">
                  {fmtDateTime(a.fecha_inicio)}
                </div>
                <div className="text-xs text-gray-500">
                  {fmtDateTime(a.fecha_fin)}
                </div>
              </div>

              {/* Responsable */}
              <div className={`ui-td p-1 ${CELL}`}>
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-8 py-2 text-xs text-gray-700 ring-1 ring-gray-200">
                  ID #{a.responsableId}
                </span>
              </div>

              {/* Procesos */}
              <div className={`ui-td p-0 ${CELL}`}>
                {a.procesos_invitados?.length ? (
                  <div className="flex max-w-full flex-wrap gap-1">
                    {a.procesos_invitados.slice(0, 2).map((p) => (
                      <span
                        key={p.id}
                        title={p.nombre}
                        className="truncate rounded-full bg-emerald-50 px-8 py-2 text-[11px] text-emerald-700 ring-1 ring-emerald-200"
                      >
                        {p.nombre}
                      </span>
                    ))}
                    {a.procesos_invitados.length > 2 && (
                      <span className="rounded-full bg-gray-100 px-8 py-2 text-[11px] text-gray-700 ring-1 ring-gray-200">
                        +{a.procesos_invitados.length - 2}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">—</span>
                )}
              </div>

              {/* Evidencias */}
              <div className={`ui-td p-0 ${CELL} text-center`}>
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex min-w-6 justify-center rounded-full bg-gray-100 px-5 py-0.5 text-[11px] text-gray-700 ring-1 ring-gray-200">
                    {a.evidencias?.length ?? 0}
                  </span>
                  {!!a.evidencias?.length && (
                    <button
                      className="ui-btn-ghost rounded-md p-1.5 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      title="Ver evidencias"
                      onClick={() => onOpenList(a)}
                    >
                      👁️
                    </button>
                  )}
                </div>
              </div>

              {/* Estado */}
              <div className={`ui-td p-10 py-5 ${CELL} text-right`}>
                <span
                  className={`ui-badge ${estadoClass(
                    a.estado
                  )} ring-1 ring-black/5`}
                >
                  {a.estado}
                </span>
              </div>

              {/* Acciones */}
              <div className={`ui-td p-0 ${CELL}`}>
                <div className="ml-auto flex w-full items-center justify-end">
                  <button
                    className="ui-btn-ghost rounded-md p-2 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    onClick={() => onEdit(a)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="ui-btn-ghost rounded-md p-2 text-rose-700 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300"
                    onClick={() => onDelete(a)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                  <button
                    className="ui-btn-ghost rounded-md p-2 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    onClick={() => onOpenUpload(a)}
                    title="Subir evidencias"
                  >
                    📂
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
