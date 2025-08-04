"use client";
import "gantt-task-react/dist/index.css";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import dayjs from "dayjs";
import { useEffect } from "react";

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

type ExtendedTask = Task & {
  estado?: string;
  responsable?: string;
};

import { useRef } from "react";

export default function ModernGanttChart({ tasks }: { tasks: Task[] }) {
  const ganttDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let tries = 0;
    const maxTries = 15;
    const interval = setInterval(() => {
      tries++;
      // Elimina encabezados "From" y "To"
      document.querySelectorAll("._WuQQf").forEach((el) => {
        const txt = el.textContent?.trim();
        if (txt === "From" || txt === "To") {
          el.parentNode?.removeChild(el);
        }
      });

      // Elimina las celdas "From" y "To" de cada fila (cuerpo)
      document.querySelectorAll("._1nBOT").forEach((row) => {
        // Quita la 2da columna si es "From"
        const fromCell = row.children[1];
        if (fromCell && fromCell.textContent?.trim() === "From") {
          row.removeChild(fromCell);
        }
        // Quita la 2da columna si es "To" (después de quitar "From", la 3ra pasa a ser la 2da)
        const toCell = row.children[1];
        if (toCell && toCell.textContent?.trim() === "To") {
          row.removeChild(toCell);
        }
      });

      // Detener si ya no quedan
      const anyFrom = Array.from(document.querySelectorAll("._WuQQf")).some(
        (el) => (el as HTMLElement).textContent?.trim() === "From"
      );
      const anyTo = Array.from(document.querySelectorAll("._WuQQf")).some(
        (el) => (el as HTMLElement).textContent?.trim() === "To"
      );
      if ((!anyFrom && !anyTo) || tries > maxTries) {
        clearInterval(interval);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [tasks]);

  const renderTooltip = ({
    task,
    fontSize,
    fontFamily,
  }: {
    task: ExtendedTask;
    fontSize: string;
    fontFamily: string;
  }) => (
    <div
      style={{
        padding: 12,
        borderRadius: 8,
        minWidth: 220,
        fontSize,
        fontFamily,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "1.07em", color: "#235" }}>
        {task.name}
      </div>
      <div style={{ color: "#555", fontSize: "13px" }}>
        {dayjs(task.start).format("DD")} {MONTHS[dayjs(task.start).month()]} -{" "}
        {dayjs(task.end).format("DD")} {MONTHS[dayjs(task.end).month()]} (
        {dayjs(task.end).diff(dayjs(task.start), "day") + 1} días)
      </div>
      <div style={{ color: "#6c6c6c", fontSize: "12px" }}>
        Progreso: {task.progress}%
      </div>
      <div style={{ color: "#2C5959", fontSize: "12px", fontWeight: 600 }}>
        Estado: {(task as ExtendedTask).estado || "-"}
      </div>
      <div style={{ color: "#777", fontSize: "12px" }}>
        Responsable: {(task as ExtendedTask).responsable || "-"}
      </div>
    </div>
  );

  return (
    <div
      ref={ganttDiv}
      style={{ background: "#fff", borderRadius: 12, padding: 16 }}
    >
      <Gantt
        tasks={tasks}
        locale="es"
        TooltipContent={renderTooltip}
        listCellWidth="180px"
        columnWidth={50}
        barFill={80}
        viewMode={ViewMode.Day}
      />
    </div>
  );
}
