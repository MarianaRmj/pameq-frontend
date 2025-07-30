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

  // Modal estado
  const [modalOpen, setModalOpen] = useState(false);

  // 1. Cargar eventos desde el backend, mapeando a los nombres de FullCalendar
  useEffect(() => {
    fetch("http://localhost:3001/events")
      .then((res) => res.json())
      .then((data: BackendEvent[]) => {
        setEvents(
          data.map((e: BackendEvent) => ({
            id: String(e.id),
            title: e.titulo,          // mapea a 'title'
            start: e.inicio,          // mapea a 'start'
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

  // 2. Crear evento: el backend sigue recibiendo campos en español,
  // pero al agregar el evento al calendario, lo mapeas a inglés
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
        userId: 1, // reemplaza por el real
      }),
    });
    if (!res.ok) throw new Error();
    const newEvent = await res.json();
    setEvents([
      ...events,
      {
        id: String(newEvent.id),
        title: newEvent.titulo,         // OJO: mapeo aquí
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

  // 3. Render del evento con tooltip
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
          `<b>${icon}${eventInfo.event.title}</b><br/>` +   // Usa .title
          (eventInfo.event.extendedProps.description || "")
        }
        data-html={true}
        className="cursor-pointer"
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
      </div>
    </div>
  );
}
