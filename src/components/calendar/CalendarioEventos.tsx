// app/dashboard/schedule/CalendarioEventos.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import type { EventContentArg, EventApi } from "@fullcalendar/core";
import { Tooltip } from "react-tooltip";
import { CrearEventoModal } from "./CrearEventoModal";
import { useConfirm } from "@/hooks/useConfirm";
import { API_URL } from "@/app/lib/api";

/** Extrae el ID numérico del evento (soporta "event:123" o solo "123") */
function getRawEventId(e: EventApi) {
  const s = String(e.id ?? "");
  return s.startsWith("event:") ? s.split(":")[1] : s;
}

/** Lee de extendedProps, tolerando nombres en inglés/español y valores vacíos */
function getEP<T = unknown>(
  e: EventApi,
  keyEn: string,
  keyEs?: string
): T | undefined {
  const ep = (e.extendedProps ?? {}) as Record<string, unknown>;
  return (ep[keyEn] ?? (keyEs ? ep[keyEs] : undefined)) as T | undefined;
}

/** Ícono según tipo (manual) */
function iconFor(type?: string) {
  switch (type) {
    case "reunion":
      return "📅";
    case "ciclo":
      return "🔄";
    case "actividad":
      return "⭐";
    default:
      return "⭐";
  }
}

export default function CalendarioEventos() {
  const calRef = useRef<FullCalendar | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();

  const refetch = () => calRef.current?.getApi().refetchEvents();

  // Permite que otros módulos (p.ej. Actividades) disparen un refresh del calendario
  useEffect(() => {
    const h = () => refetch();
    window.addEventListener("calendar:refetch", h);
    return () => window.removeEventListener("calendar:refetch", h);
  }, []);

  // Crear evento manual y refrescar
  const handleCreateEvent = async (form: {
    titulo: string;
    descripcion?: string;
    tipo?: string;
    inicio: string | Date;
    fin: string | Date;
  }) => {
    const res = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.titulo,
        description: form.descripcion ?? "",
        type: form.tipo ?? "seleccione",
        start: form.inicio,
        end: form.fin,
        userId: 1,
      }),
    });
    if (!res.ok) throw new Error("Error creando evento");
    refetch();
  };

  // Render del contenido compacto del evento (con tooltip)
  function renderEventContent(eventInfo: EventContentArg) {
    const ep = eventInfo.event.extendedProps as Record<string, unknown>;
    const typeRaw =
      ep?.type ??
      ep?.tipo ??
      (ep?.refType === "activity" ? "actividad" : undefined);
    const type = typeof typeRaw === "string" ? typeRaw : undefined;
    const icon = iconFor(type);

    const description = ep?.description ?? ep?.descripcion ?? "";

    return (
      <div
        data-tip={`<b>${icon} ${eventInfo.event.title}</b><br/>${
          description || ""
        }`}
        data-html={true}
        className="cursor-pointer max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap flex items-center"
      >
        <span className="font-nunito">
          {icon} {eventInfo.event.title}
        </span>
      </div>
    );
  }

  // ¿Es un evento vinculado a una actividad?
  const isActivityEvent = (e: EventApi | null) => {
    if (!e) return false;
    const refType = getEP<string>(e, "refType");
    return refType === "activity";
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-2xl p-6 border border-verdeSuave relative">
        <h2 className="text-2xl font-nunito text-[#2C5959] mb-1 flex items-center">
          <svg
            className="h-1  text-verdeOscuro"
            fill="none"
            strokeWidth="1"
            viewBox="0 0 14 14"
          >
            <path d="M8 7V3M16 7V3M4 11H20M4 19H20M4 15H20" />
          </svg>
          Calendario Institucional
        </h2>
        <p className="text-base text-gray-500 mb-4">
          Agenda tus actividades, reuniones y eventos aquí.
        </p>

        <div className="overflow-x-auto">
          <FullCalendar
            ref={calRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            height="auto"
            locales={[esLocale]}
            locale="es"
            // 🔹 Feed de eventos desde el backend (incluye manuales y actividades)
            events={{
              url: `${API_URL}/events/feed/calendar`,
              method: "GET",
              failure: () => console.error("No se pudieron cargar eventos"),
            }}
            eventContent={renderEventContent}
            eventClick={(info) => {
              setSelectedEvent(info.event);
              setDetailModalOpen(true);
            }}
          />

          <Tooltip />

          <div className="flex justify-end mb-3 py-5">
            <button
              className="bg-verdeOscuro hover:bg-verdeClaro text-white font-nunito py-1 px-4 rounded-lg shadow transition-all"
              onClick={() => setModalOpen(true)}
            >
              + Crear evento
            </button>
          </div>
        </div>

        {/* Modal de creación */}
        <CrearEventoModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreateEvent}
        />

        {/* Modal de detalle */}
        {detailModalOpen && selectedEvent && !editMode && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl border border-verdeSuave animate-fade-in-up relative">
              <button
                className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-xl"
                onClick={() => setDetailModalOpen(false)}
                aria-label="Cerrar"
              >
                ×
              </button>

              {(() => {
                const type =
                  getEP<string>(selectedEvent, "type", "tipo") ??
                  (getEP<string>(selectedEvent, "refType") === "activity"
                    ? "actividad"
                    : undefined);
                const icon = iconFor(type);
                const description =
                  getEP<string>(selectedEvent, "description", "descripcion") ??
                  "";

                return (
                  <>
                    <h3 className="text-xl font-nunito text-[#2C5959] mb-4 flex items-center gap-2">
                      <span>{icon}</span>
                      {selectedEvent.title}
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <span className="block text-xs font-nunito text-gray-400">
                          Descripción:
                        </span>
                        <span className="block text-base">
                          {description || "Sin descripción"}
                        </span>
                      </div>

                      <div className="flex gap-4">
                        <div>
                          <span className="block text-xs font-nunito text-gray-400">
                            Inicio:
                          </span>
                          <span className="block text-base">
                            {selectedEvent.start
                              ? new Date(selectedEvent.start).toLocaleString(
                                  "es-CO"
                                )
                              : "-"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs font-nunito text-gray-400">
                            Fin:
                          </span>
                          <span className="block text-base">
                            {selectedEvent.end
                              ? new Date(selectedEvent.end).toLocaleString(
                                  "es-CO"
                                )
                              : "-"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div>
                          <span className="block text-xs font-nunito text-gray-400">
                            Tipo:
                          </span>
                          <span className="block text-base capitalize">
                            {type || "-"}
                          </span>
                        </div>
                        {isActivityEvent(selectedEvent) && (
                          <div>
                            <span className="block text-xs font-nunito text-gray-400">
                              Vinculado a:
                            </span>
                            <span className="block text-base">Actividad</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Acciones */}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className={`px-3 h-9 rounded-md font-nunito text-white ${
                    isActivityEvent(selectedEvent)
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-verdeOscuro hover:bg-verdeClaro"
                  }`}
                  onClick={() => {
                    if (isActivityEvent(selectedEvent)) return;
                    setEditMode(true);
                    setDetailModalOpen(false);
                  }}
                  title={
                    isActivityEvent(selectedEvent)
                      ? "Este evento proviene de una actividad. Edítalo desde Actividades."
                      : "Editar evento"
                  }
                >
                  Editar
                </button>

                <button
                  className={`px-3 h-9 rounded-md font-nunito text-white ${
                    isActivityEvent(selectedEvent)
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  onClick={() => {
                    if (isActivityEvent(selectedEvent)) return;
                    const rawId = getRawEventId(selectedEvent);
                    confirm(
                      "¿Estás seguro que deseas ✖️ eliminar este evento? Esta acción no se puede deshacer.",
                      async () => {
                        await fetch(`${API_URL}/events/${rawId}`, {
                          method: "DELETE",
                        });
                        refetch();
                        setDetailModalOpen(false);
                      }
                    );
                  }}
                  title={
                    isActivityEvent(selectedEvent)
                      ? "Este evento proviene de una actividad. Elimínalo desde Actividades."
                      : "Eliminar evento"
                  }
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición para eventos manuales */}
        {editMode && selectedEvent && (
          <CrearEventoModal
            open={editMode}
            onClose={() => {
              setEditMode(false);
              setSelectedEvent(null);
            }}
            onCreate={async (form) => {
              // Solo debería entrar aquí si NO es actividad
              const rawId = getRawEventId(selectedEvent);
              const res = await fetch(`${API_URL}/events/${rawId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  // tu UpdateEventDto acepta los mismos nombres que CreateEventDto
                  title: form.titulo,
                  description: form.descripcion ?? "",
                  type: form.tipo ?? "manual",
                  start: form.inicio,
                  end: form.fin,
                  userId: 1,
                }),
              });
              if (!res.ok) throw new Error("Error actualizando evento");
              refetch();
              setEditMode(false);
              setSelectedEvent(null);
            }}
            editMode={true}
            initialData={{
              titulo: String(selectedEvent.title || ""),
              descripcion:
                getEP<string>(selectedEvent, "description", "descripcion") ||
                "",
              tipo:
                getEP<string>(selectedEvent, "type", "tipo") ??
                (getEP<string>(selectedEvent, "refType") === "activity"
                  ? "actividad"
                  : "manual"),
              inicio: selectedEvent.start!,
              fin: selectedEvent.end!,
            }}
          />
        )}
      </div>
      <ConfirmModal />
    </div>
  );
}
