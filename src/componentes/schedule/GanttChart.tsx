"use client";
import { useEffect, useRef } from "react";
import Gantt from "frappe-gantt";

export interface GanttTask {
  id: string | number;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
}

function customPopupHtml(task: GanttTask) {
  console.log("Popup ESPAÑOL:", task);
  const meses = [
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
  const formatFecha = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")} ${meses[d.getMonth()]}`;
  };
  const diasEntre = (f1: string, f2: string) => {
    const a = new Date(f1),
      b = new Date(f2);
    return Math.max(
      1,
      Math.round((b.getTime() - a.getTime()) / (1000 * 3600 * 24)) + 1
    );
  };

  return `
    <div style="padding:10px 15px; border-radius:8px;">
      <div style="font-size:1.07em; font-weight:800; color:#235">${
        task.name
      }</div>
      <div style="color:#555; font-size:13px;">
        ${formatFecha(task.start)} - ${formatFecha(task.end)} (${diasEntre(
    task.start,
    task.end
  )} días)
      </div>
      <div style="color:#6c6c6c; font-size:12px;">
        Progreso: ${task.progress}%
      </div>
    </div>
  `;
}

export default function GanttChart({ tasks }: GanttChartProps) {
  const ganttRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ganttRef.current && tasks.length) {
      ganttRef.current.innerHTML = "";
      new Gantt(ganttRef.current, tasks, {
        on_click: () => {},
        on_date_change: () => {},
        on_progress_change: () => {},
        custom_popup_html: customPopupHtml,
      });

      // Forzar reemplazo de los tooltips (hack directo)
      setTimeout(() => {
        document.querySelectorAll(".popup-wrapper").forEach((el) => {
          el.innerHTML =
            "<div style='padding:10px;font-size:15px'>¡Popup en español!</div>";
        });
      }, 800);
    }
  }, [tasks]);

  return (
    <div>
      <div ref={ganttRef} className="gantt-container" />
    </div>
  );
}
