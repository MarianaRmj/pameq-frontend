"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import type { EventInput } from "@fullcalendar/core";
import { Tooltip } from "react-tooltip";
import esLocale from "@fullcalendar/core/locales/es";
import { CrearEventoModal } from "./CrearEventoModal";
import type { EventContentArg } from "@fullcalendar/core";
import type { EventApi } from "@fullcalendar/core";
import { useConfirm } from "@/hooks/useConfirm";

type BackendEvent = {
  id: number | string;
  titulo: string;
  inicio: string;
  fin?: string;
  descripcion?: string;
  tipo?: string;
};

export default function CalendarioEventos() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();

  useEffect(() => {
    fetch("http://localhost:3001/events")
      .then((res) => res.json())
      .then((data: BackendEvent[]) => {
        setEvents(
          data.map((e: BackendEvent) => ({
            id: String(e.id),
            title: e.titulo,
            start: e.inicio,
            end: e.fin,
            description: e.descripcion,
            type: e.tipo,
            backgroundColor:
              e.tipo === "reunion"
                ? "#33A691"
                : e.tipo === "ciclo"
                ? "#B8D9C4"
                : "#2C5959",
            borderColor:
              e.tipo === "reunion"
                ? "#33A691"
                : e.tipo === "ciclo"
                ? "#B8D9C4"
                : "#2C5959",
            textColor: "#171717",
          }))
        );
        setLoading(false);
      });
  }, []);

  const handleCreateEvent = async (form: {
    titulo: string;
    descripcion: string;
    tipo: string;
    inicio: string;
    fin: string;
  }) => {
    const res = await fetch("http://localhost:3001/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: form.titulo,
        descripcion: form.descripcion,
        tipo: form.tipo,
        inicio: form.inicio,
        fin: form.fin,
        userId: 1,
      }),
    });
    if (!res.ok) throw new Error();
    const newEvent = await res.json();
    setEvents([
      ...events,
      {
        id: String(newEvent.id),
        title: newEvent.titulo,
        start: newEvent.inicio,
        end: newEvent.fin,
        description: newEvent.descripcion,
        type: newEvent.tipo,
        backgroundColor:
          newEvent.tipo === "reunion"
            ? "#33A691"
            : newEvent.tipo === "ciclo"
            ? "#B8D9C4"
            : "#2C5959",
        borderColor:
          newEvent.tipo === "reunion"
            ? "#33A691"
            : newEvent.tipo === "ciclo"
            ? "#B8D9C4"
            : "#2C5959",
        textColor: "#171717",
      },
    ]);
  };

  function renderEventContent(eventInfo: EventContentArg) {
    let icon = "";
    if (eventInfo.event.extendedProps.type === "reunion") {
      icon = "📅 ";
    } else if (eventInfo.event.extendedProps.type === "ciclo") {
      icon = "🔄 ";
    } else {
      icon = "⭐ ";
    }
    return (
      <div
        data-tip={
          `<b>${icon}${eventInfo.event.title}</b><br/>` +
          (eventInfo.event.extendedProps.description || "")
        }
        data-html={true}
        className="cursor-pointer max-w-[115px] overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ display: "flex", alignItems: "center" }}
      >
        <span className="font-semibold">
          {icon}
          {eventInfo.event.title}
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-2xl p-6 border border-verdeSuave relative">
        <h2 className="text-2xl font-bold text-[#2C5959] mb-2 flex items-center gap-2">
          <svg
            className="h-7 w-7 text-[#33A691]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M8 7V3M16 7V3M4 11H20M4 19H20M4 15H20" />
          </svg>
          Calendario Institucional
        </h2>
        <p className="text-base text-gray-500 mb-4">
          Agenda tus actividades, reuniones y ciclos aquí.
        </p>
        <div className="overflow-x-auto">
          {loading ? (
            <div>Cargando eventos...</div>
          ) : (
            <>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                events={events}
                eventContent={renderEventContent}
                eventClick={(info) => {
                  setSelectedEvent(info.event);
                  setDetailModalOpen(true);
                }}
                height="auto"
                locales={[esLocale]}
                locale="es"
              />
              <Tooltip />
            </>
          )}
          <div className="flex justify-end mb-3 py-5">
            <button
              className="bg-verdeOscuro hover:bg-verdeClaro text-white font-semibold py-1 px-4 rounded-lg shadow transition-all"
              onClick={() => setModalOpen(true)}
            >
              + Crear evento
            </button>
          </div>
        </div>
        <CrearEventoModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreateEvent}
        />
        {detailModalOpen && selectedEvent && !editMode && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl border border-verdeSuave animate-fade-in-up relative">
              <button
                className="absolute top-2 right-3 text-gray-400 hover:text-red-500 text-xl"
                onClick={() => setDetailModalOpen(false)}
              >
                ×
              </button>
              <h3 className="text-xl font-bold text-[#2C5959] mb-4 flex items-center gap-2">
                <span>
                  {selectedEvent.extendedProps?.type === "reunion"
                    ? "📅"
                    : selectedEvent.extendedProps?.type === "ciclo"
                    ? "🔄"
                    : "⭐"}
                </span>
                {selectedEvent.title}
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="block text-xs font-bold text-gray-400">
                    Descripción:
                  </span>
                  <span className="block text-base">
                    {selectedEvent.extendedProps?.description ||
                      "Sin descripción"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div>
                    <span className="block text-xs font-bold text-gray-400">
                      Inicio:
                    </span>
                    <span className="block text-base">
                      {selectedEvent.start
                        ? new Date(selectedEvent.start).toLocaleString("es-CO")
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400">
                      Fin:
                    </span>
                    <span className="block text-base">
                      {selectedEvent.end
                        ? new Date(selectedEvent.end).toLocaleString("es-CO")
                        : "-"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400">
                    Tipo:
                  </span>
                  <span className="block text-base capitalize">
                    {selectedEvent.extendedProps?.type || "-"}
                  </span>
                </div>
              </div>
              {/* BOTONES */}
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="bg-verdeOscuro hover:bg-verdeClaro text-white px-2 rounded-md font-semibold"
                  onClick={() => {
                    setEditMode(true);
                    setDetailModalOpen(false);
                  }}
                >
                  Editar
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 flex items-center gap-2 text-white px-2 rounded-md font-semibold transition-colors"
                  onClick={() => {
                    confirm(
                      "¿Estás seguro que deseas ✖️ eliminar este evento? Esta acción no se puede deshacer.",
                      async () => {
                        await fetch(
                          `http://localhost:3001/events/${selectedEvent.id}`,
                          { method: "DELETE" }
                        );
                        setEvents(
                          events.filter((e) => e.id !== selectedEvent.id)
                        );
                        setDetailModalOpen(false);
                      }
                    );
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
        {editMode && selectedEvent && (
          <CrearEventoModal
            open={editMode}
            onClose={() => {
              setEditMode(false);
              setSelectedEvent(null);
            }}
            onCreate={async (form) => {
              const res = await fetch(
                `http://localhost:3001/events/${selectedEvent.id}`,
                {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(form),
                }
              );
              if (!res.ok) throw new Error();
              const updated = await res.json();
              setEvents(
                events.map((e) =>
                  e.id === selectedEvent.id
                    ? {
                        ...e,
                        title: updated.titulo,
                        start: updated.inicio,
                        end: updated.fin,
                        description: updated.descripcion,
                        type: updated.tipo,
                        backgroundColor:
                          updated.tipo === "reunion"
                            ? "#33A691"
                            : updated.tipo === "ciclo"
                            ? "#B8D9C4"
                            : "#2C5959",
                        borderColor:
                          updated.tipo === "reunion"
                            ? "#33A691"
                            : updated.tipo === "ciclo"
                            ? "#B8D9C4"
                            : "#2C5959",
                        textColor: "#171717",
                      }
                    : e
                )
              );
              setEditMode(false);
              setSelectedEvent(null);
            }}
            initialData={{
              titulo: selectedEvent.title as string,
              descripcion: selectedEvent.extendedProps?.description,
              tipo: selectedEvent.extendedProps?.type,
              inicio: selectedEvent.start,
              fin: selectedEvent.end,
            }}
            editMode={true}
          />
        )}
      </div>
      <ConfirmModal />
    </div>
  );
}
