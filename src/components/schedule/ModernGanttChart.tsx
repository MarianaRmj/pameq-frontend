"use client";
import "gantt-task-react/dist/index.css";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import dayjs from "dayjs";
import { useMemo, useRef, useState, useEffect } from "react";
import { FiFileText } from "react-icons/fi";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { Tooltip } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

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
type ExtendedTask = Task & { estado?: string; responsable?: string };

export default function ModernGanttChart({
  tasks,
  cicloId,
}: {
  tasks: Task[];
  cicloId?: string;
}) {
  const ganttDiv = useRef<HTMLDivElement>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // ======== UI state: view + zoom ========
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const [columnWidth, setColumnWidth] = useState(46); // se recalcula abajo

  // ======== Auto-fit de ancho por rango de fechas ========
  const dateSpan = useMemo(() => {
    if (!tasks?.length) return { days: 0 };
    const starts = tasks.map(
      (t) => +new Date(t.start as string | number | Date)
    );
    const ends = tasks.map((t) => +new Date(t.end as string | number | Date));
    const min = Math.min(...starts);
    const max = Math.max(...ends);
    const days = Math.max(
      1,
      Math.ceil((max - min) / (1000 * 60 * 60 * 24)) + 1
    );
    return { days };
  }, [tasks]);

  useEffect(() => {
    // target: ~ 1100-1300px útiles para la parte de gráfico (no lista)
    // ajusta densidad según vista
    const ideal = 1150;
    const perCol = (mode: ViewMode) => {
      if (mode === ViewMode.Day)
        return Math.min(
          70,
          Math.max(38, Math.floor(ideal / Math.max(1, dateSpan.days)))
        );
      if (mode === ViewMode.Week) return 60;
      if (mode === ViewMode.Month) return 42;
      return 46;
    };
    setColumnWidth(perCol(viewMode));
  }, [viewMode, dateSpan.days]);

  // ======== Export Excel ========
  const handleDescargarExcel = () => {
    window.open(
      `${BASE_URL}/schedule-tasks/export/excel${
        cicloId ? `?cicloId=${cicloId}` : ""
      }`,
      "_blank"
    );
  };

  // ======== Export PDF (tu misma lógica, sin cambios de fondo) ========
  const handleExportarPDFCompleto = async () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    doc.setFontSize(16);
    doc.setTextColor(44, 89, 89);
    doc.text("CronogramaPAMEC", 15, 18);
    const fecha = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text(`Fecha de generación: ${fecha}`, 15, 25);

    const columns = [
      { header: "Id", dataKey: "id" },
      { header: "Nombre de tarea", dataKey: "nombre" },
      { header: "Duración", dataKey: "duracion" },
      { header: "Comienzo", dataKey: "comienzo" },
      { header: "Fin", dataKey: "fin" },
      { header: "Predecesoras", dataKey: "predecesoras" },
    ];
    const rows = tasks.map((t, i) => ({
      id: t.id ?? i + 1,
      nombre: t.name,
      duracion:
        t.start && t.end ? dayjs(t.end).diff(dayjs(t.start), "day") + 1 : "",
      comienzo: t.start ? dayjs(t.start).format("DD/MM/YYYY") : "",
      fin: t.end ? dayjs(t.end).format("DD/MM/YYYY") : "",
      predecesoras: t.dependencies
        ? Array.isArray(t.dependencies)
          ? t.dependencies.join(", ")
          : t.dependencies
        : "",
    }));

    autoTable(doc, {
      startY: 32,
      columns,
      body: rows,
      styles: { fontSize: 9, cellPadding: 2, font: "nunito" },
      headStyles: {
        fillColor: [44, 89, 89],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [232, 247, 236] },
      theme: "striped",
      margin: { left: 10, right: 10 },
      didDrawPage: () => {
        doc.setFontSize(9);
        doc.setTextColor(140);
        doc.text(`Página ${doc.getNumberOfPages()}`, 200, 290, {
          align: "right",
        });
      },
    });

    if (!ganttDiv.current) {
      doc.save("GANTT.pdf");
      return;
    }

    const originalStyle = {
      width: ganttDiv.current.style.width,
      height: ganttDiv.current.style.height,
      overflowX: ganttDiv.current.style.overflowX,
      overflowY: ganttDiv.current.style.overflowY,
    };
    const rowHeight = 34;
    const minWidth = 170;
    const numRows = tasks.length;
    const numCols = 30;
    const chartWidth = Math.max(1200, minWidth * numCols);
    const chartHeight = Math.max(440, rowHeight * (numRows + 2));
    ganttDiv.current.style.width = `${chartWidth}px`;
    ganttDiv.current.style.height = `${chartHeight}px`;
    ganttDiv.current.style.overflowX = "visible";
    ganttDiv.current.style.overflowY = "visible";
    await new Promise((r) => setTimeout(r, 200));
    const ganttArea = ganttDiv.current.querySelector("div") || ganttDiv.current;
    const canvas = await html2canvas(ganttArea as HTMLElement, {
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");
    ganttDiv.current.style.width = originalStyle.width;
    ganttDiv.current.style.height = originalStyle.height;
    ganttDiv.current.style.overflowX = originalStyle.overflowX;
    ganttDiv.current.style.overflowY = originalStyle.overflowY;

    const pageWidth = 297,
      pageHeight = 210,
      marginX = 10,
      marginY = 25;
    const usableWidth = pageWidth - marginX * 2;
    const usableHeight = pageHeight - marginY - 10;
    const imgPixelWidth = canvas.width,
      imgPixelHeight = canvas.height;
    const mmPerPxWidth = usableWidth / imgPixelWidth;
    const mmPerPxHeight = usableHeight / imgPixelHeight;

    let y = 0;
    while (y < imgPixelHeight) {
      let x = 0;
      while (x < imgPixelWidth) {
        doc.addPage("a4", "landscape");
        doc.setFontSize(16);
        doc.setTextColor(44, 89, 89);
        doc.text("Diagrama Gantt - CronogramaPAMEC", marginX, 18);
        doc.addImage(
          imgData,
          "PNG",
          marginX,
          marginY,
          usableWidth,
          usableHeight,
          undefined,
          "FAST"
        );
        doc.setFontSize(9);
        doc.setTextColor(140);
        doc.text(
          `Página ${doc.getNumberOfPages()}`,
          pageWidth - marginX,
          pageHeight - 7,
          { align: "right" }
        );
        x += usableWidth / mmPerPxWidth;
      }
      y += usableHeight / mmPerPxHeight;
    }
    doc.deletePage(1);
    doc.save("GANTT.pdf");
  };

  const handleFullScreen = () => {
    if (!ganttDiv.current) return;
    if (ganttDiv.current.requestFullscreen)
      ganttDiv.current.requestFullscreen();
    else
      (
        ganttDiv.current as HTMLDivElement & {
          webkitRequestFullscreen?: () => void;
        }
      )?.webkitRequestFullscreen?.();
  };

  // ======== Tooltip ========
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
        padding: 10,
        borderRadius: 12,
        minWidth: 220,
        fontSize,
        fontFamily,
        background: "#FFFFFF",
        boxShadow: "0 10px 24px rgba(44,89,89,.16)",
        border: "1px solid #E5F2EE",
      }}
    >
      <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#2C5959" }}>
        {task.name}
      </div>
      <div style={{ color: "#4a4a4a", fontSize: 12, marginTop: 2 }}>
        {dayjs(task.start).format("DD")} {MONTHS[dayjs(task.start).month()]} –{" "}
        {dayjs(task.end).format("DD")} {MONTHS[dayjs(task.end).month()]} ·{" "}
        {dayjs(task.end).diff(dayjs(task.start), "day") + 1} días
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
        <span style={{ fontSize: 12, color: "#0F766E" }}>
          Progreso: <b>{task.progress}%</b>
        </span>
        <span style={{ fontSize: 12, color: "#2C5959" }}>
          Estado: <b>{(task as ExtendedTask).estado || "-"}</b>
        </span>
      </div>
      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
        Responsable: {(task as ExtendedTask).responsable || "-"}
      </div>
    </div>
  );

  // ======== Barra superior (controles) ========
  type ZoomButtonProps = {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };

  const ZoomButton = ({
    label,
    onClick,
    disabled = false,
  }: ZoomButtonProps) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2 py-1 rounded-md text-sm font-medium transition-all border ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow"
      } `}
      style={{ background: "#fff", color: "#2C5959", borderColor: "#DDE9E6" }}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <div>
      {/* Controles y acciones */}
      <div className="flex flex-wrap gap-2 mb-2 items-center border-b border-[#e0e7ea] pb-2 px-1 bg-transparent">
        <span className="font-nunito text-verdeOscuro text-base tracking-tight">
          Diagrama Gantt del Proyecto
        </span>
        <div className="flex-1" />
        {/* View switcher */}
        <div className="flex items-center gap-1 bg-white rounded-lg border border-[#DDE9E6] p-1">
          {[
            { k: ViewMode.Day, t: "Día" },
            { k: ViewMode.Week, t: "Semana" },
            { k: ViewMode.Month, t: "Mes" },
          ].map((v) => (
            <button
              key={v.t}
              onClick={() => setViewMode(v.k)}
              className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
                viewMode === v.k ? "text-white" : "text-[#2C5959]"
              }`}
              style={{
                background: viewMode === v.k ? "#2C5959" : "transparent",
              }}
              type="button"
            >
              {v.t}
            </button>
          ))}
        </div>
        {/* Zoom */}
        <div className="flex items-center gap-1 ml-1">
          <ZoomButton
            label="−"
            onClick={() => setColumnWidth((c) => Math.max(28, c - 6))}
          />
          <span className="text-sm text-[#2C5959] px-1">Zoom</span>
          <ZoomButton
            label="+"
            onClick={() => setColumnWidth((c) => Math.min(90, c + 6))}
          />
        </div>

        {/* Export/Fullscreen */}
        <Tooltip title="Descargar Excel del cronograma">
          <button
            className="flex items-center gap-1 px-2 py-1 bg-[#217346] hover:bg-[#185c37] text-white rounded-md shadow font-nunito text-sm transition-all"
            onClick={handleDescargarExcel}
            type="button"
          >
            <FaFileExcel size={17} />
            <span className="hidden sm:inline font-medium">Excel</span>
          </button>
        </Tooltip>
        <Tooltip title="Descargar PDF combinado (tabla + Gantt)">
          <button
            className="flex items-center gap-1 px-2 py-1 bg-[#D14343] hover:bg-[#b23838] text-white rounded-md shadow font-nunito text-sm transition-all"
            onClick={handleExportarPDFCompleto}
            type="button"
          >
            <FaFilePdf size={17} />
            <span className="hidden sm:inline font-medium">PDF</span>
          </button>
        </Tooltip>
        <Tooltip title="Ver diagrama en pantalla completa">
          <button
            className="flex items-center gap-1 px-2 py-1 bg-verdeClaro hover:bg-verdeOscuro text-white rounded-md shadow font-nunito text-sm transition-all"
            onClick={handleFullScreen}
            type="button"
          >
            <FiFileText size={17} />
            <span className="hidden sm:inline font-medium">
              Pantalla completa
            </span>
          </button>
        </Tooltip>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-2 text-sm font-nunito">
        {[
          { label: "Pendiente", color: "#F2C14E" },
          { label: "En progreso", color: "#2C5959" },
          { label: "Finalizado", color: "#33A691 " },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span
              style={{
                width: 14,
                height: 10,
                borderRadius: 2,
                background: s.color,
                display: "inline-block",
              }}
            />
            <span className="text-[#2C5959]">{s.label}</span>
          </div>
        ))}
      </div>
      {/* Gantt */}
      <div
        ref={ganttDiv}
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 16,
          minHeight: 460,
          overflowX: "auto",
          boxShadow: "0 4px 16px rgba(44,89,89,0.10)",
          width: "100%",
          maxWidth: "100vw",
        }}
      >
        <div style={{ minWidth: 1100 }}>
          <Gantt
            tasks={tasks}
            locale="es"
            TooltipContent={renderTooltip}
            listCellWidth="200px" // más cómodo para nombres largos
            columnWidth={columnWidth}
            rowHeight={34}
            fontFamily="Nunito, Arial, sans-serif"
            fontSize="13px"
            barCornerRadius={8}
            barFill={90}
            todayColor="#33A691"
            arrowColor="#8BBFB9" // flechas más suaves
            ganttHeight={460}
            viewMode={viewMode}
          />
        </div>
      </div>
      {/* Tema y overrides visuales */}
      <style jsx global>{`
        :root {
          --g-arrow-color: #8bbfb9;
          --g-bar-color: #2c5959 !important;
          --g-bar-border: #1e4545 !important;
          --g-progress-color: #33a691 !important;
          --g-text-dark: #17202a;
          --g-text-muted: #6b7280;
          --g-row-color: #ffffff;
          --g-row-border-color: #e7f0ee !important;
          --g-tick-color: #f4f7f6;
          --g-tick-color-thick: #e7f0ee;
          --g-header-background: #f9fcfb;
          --g-actions-background: #f4f7f6;
          --g-today: #33a691;
        }
        /* Encabezados calendario */
        .calendarTop,
        .calendarBottom {
          background: var(--g-header-background) !important;
          color: #2c5959 !important;
          font-weight: 700 !important;
        }
        /* Tabla izquierda (lista de tareas) */
        .taskListWrapper {
          background: #fff !important;
          border-right: 1px solid #e7f0ee !important;
        }
        .taskListHeader {
          background: #f3faf8 !important;
          color: #2c5959 !important;
          font-weight: 800 !important;
        }
        .taskListTable tr:nth-child(even) td {
          background: #fcfefd !important;
        }
        .taskListTable td {
          border-bottom: 1px solid #f0f5f4 !important;
        }
        /* Grid filas */
        .gridRow {
          stroke: #f0f5f4 !important;
        }
        .bar {
          filter: drop-shadow(0 2px 4px rgba(44, 89, 89, 0.12));
        }
        .handle {
          fill: #1e4545 !important;
        }
        /* Línea de hoy más visible */
        .today {
          opacity: 0.16 !important;
        }
        /* Hover fila */
        .svgWrapper:hover .bar {
          opacity: 0.95;
        }
      `}</style>
    </div>
  );
}
