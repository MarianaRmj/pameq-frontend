"use client";
import "gantt-task-react/dist/index.css";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import dayjs from "dayjs";
import { useRef } from "react";
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

  const handleDescargarExcel = () => {
    window.open(
      `${BASE_URL}/schedule-tasks/export/excel${
        cicloId ? `?cicloId=${cicloId}` : ""
      }`,
      "_blank"
    );
  };

  // --- FUNCION PRINCIPAL PDF COMBINADO ---
  const handleExportarPDFCompleto = async () => {
    // 1. TABLA EN PDF
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
      duracion: t.start && t.end ? dayjs(t.end).diff(dayjs(t.start), "day") + 1 : "",
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
      styles: {
        fontSize: 9,
        cellPadding: 2,
        font: "nunito",
      },
      headStyles: {
        fillColor: [44, 89, 89],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [232, 247, 236],
      },
      theme: "striped",
      margin: { left: 10, right: 10 },
      didDrawPage: function () {
        doc.setFontSize(9);
        doc.setTextColor(140);
        doc.text(`Página ${doc.getNumberOfPages()}`, 200, 290, {
          align: "right",
        });
      },
    });

    // 2. GANTT COMPLETO (sin scrolls)
    if (!ganttDiv.current) return;

    // --- AMPLÍA el div para que html2canvas capture todo ---
    const originalStyle = {
      width: ganttDiv.current.style.width,
      height: ganttDiv.current.style.height,
      overflowX: ganttDiv.current.style.overflowX,
      overflowY: ganttDiv.current.style.overflowY,
    };

    // ESTIMA el tamaño necesario:
    const rowHeight = 34;
    const minWidth = 170; // ancho de columna (ajusta según tu diseño)
    const numRows = tasks.length;
    const numCols = 30; // Ajusta según la cantidad de columnas de tiempo que tengas (¡Pruébalo! O pon un valor alto como 50)
    const chartWidth = Math.max(1200, minWidth * numCols);
    const chartHeight = Math.max(440, rowHeight * (numRows + 2));

    ganttDiv.current.style.width = `${chartWidth}px`;
    ganttDiv.current.style.height = `${chartHeight}px`;
    ganttDiv.current.style.overflowX = "visible";
    ganttDiv.current.style.overflowY = "visible";

    await new Promise((r) => setTimeout(r, 200));

    // CAPTURA GANTT
    const ganttArea = ganttDiv.current.querySelector("div") || ganttDiv.current;
    const canvas = await html2canvas(ganttArea, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    // VUELVE A SU TAMAÑO ORIGINAL
    ganttDiv.current.style.width = originalStyle.width;
    ganttDiv.current.style.height = originalStyle.height;
    ganttDiv.current.style.overflowX = originalStyle.overflowX;
    ganttDiv.current.style.overflowY = originalStyle.overflowY;

    // 3. PAGINADO HORIZONTAL Y VERTICAL
    // Parámetros PDF A4 landscape
    const pageWidth = 297; // mm
    const pageHeight = 210; // mm
    const marginX = 10;
    const marginY = 25;

    const usableWidth = pageWidth - marginX * 2;
    const usableHeight = pageHeight - marginY - 10;

    const imgPixelWidth = canvas.width;
    const imgPixelHeight = canvas.height;

    const mmPerPxWidth = usableWidth / imgPixelWidth;
    const mmPerPxHeight = usableHeight / imgPixelHeight;

    // Paginación en ambas direcciones
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

    // Elimina la primera página en blanco (por jsPDF bug al agregar antes de usar addPage)
    doc.deletePage(1);

    doc.save("GANTT.pdf");
  };

  // --- OTRAS FUNCIONES ---
  const handleFullScreen = () => {
    if (ganttDiv.current) {
      if (ganttDiv.current.requestFullscreen)
        ganttDiv.current.requestFullscreen();
      else if (
        (
          ganttDiv.current as HTMLDivElement & {
            webkitRequestFullscreen?: () => void;
          }
        ).webkitRequestFullscreen
      ) {
        const webkitRequestFullscreen = (
          ganttDiv.current as HTMLDivElement & {
            webkitRequestFullscreen?: () => void;
          }
        ).webkitRequestFullscreen;
        if (typeof webkitRequestFullscreen === "function") {
          webkitRequestFullscreen.call(ganttDiv.current);
        }
      }
    }
  };

  // Tooltip Gantt
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
        borderRadius: 10,
        minWidth: 210,
        fontSize,
        fontFamily,
        background: "#F8FBFB",
        boxShadow: "0 6px 16px rgba(44,89,89,.12)",
        border: "1px solid #33A691",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "1.12em", color: "#2C5959" }}>
        {task.name}
      </div>
      <div style={{ color: "#555", fontSize: "13px", margin: "2px 0 0" }}>
        {dayjs(task.start).format("DD")} {MONTHS[dayjs(task.start).month()]} -{" "}
        {dayjs(task.end).format("DD")} {MONTHS[dayjs(task.end).month()]} (
        {dayjs(task.end).diff(dayjs(task.start), "day") + 1} días)
      </div>
      <div
        style={{
          color: "#33A691",
          fontSize: "12px",
          fontWeight: 600,
          marginTop: 2,
        }}
      >
        Progreso: {task.progress}%
      </div>
      <div style={{ color: "#2C5959", fontSize: "12px", fontWeight: 500 }}>
        Estado: {task.estado || "-"}
      </div>
      <div style={{ color: "#777", fontSize: "12px" }}>
        Responsable: {task.responsable || "-"}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-row gap-2 mb-2 items-center border-b border-[#e0e7ea] pb-1 px-1 bg-transparent">
        <span className="font-bold text-verdeOscuro text-base flex items-center gap-2 tracking-tight">
          Diagrama Gantt del Proyecto
        </span>
        <span className="flex-1" />
        <Tooltip title="Descargar Excel del cronograma">
          <button
            className="flex items-center gap-1 px-2 py-1 bg-[#217346] hover:bg-[#185c37] text-white rounded-md shadow font-nunito text-sm transition-all"
            onClick={handleDescargarExcel}
          >
            <FaFileExcel size={17} />
            <span className="hidden sm:inline font-medium">Excel</span>
          </button>
        </Tooltip>
        <Tooltip title="Descargar PDF combinado (tabla + Gantt)">
          <button
            className="flex items-center gap-1 px-2 py-1 bg-[#007bff] hover:bg-[#0056b3] text-white rounded-md shadow font-nunito text-sm transition-all"
            onClick={handleExportarPDFCompleto}
          >
            <FaFilePdf size={17} />
            <span className="hidden sm:inline font-medium">PDF Completo</span>
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
      <div
        ref={ganttDiv}
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 18,
          minHeight: 440,
          overflowX: "auto",
          boxShadow: "0 3px 12px 0 rgba(44,89,89,0.10)",
          width: "100%",
          maxWidth: "100vw",
        }}
      >
        <div style={{ minWidth: 1200 }}>
          <Gantt
            tasks={tasks}
            locale="es"
            TooltipContent={renderTooltip}
            listCellWidth="170px"
            columnWidth={46}
            rowHeight={34}
            fontFamily="Nunito, Arial, sans-serif"
            fontSize="13px"
            barCornerRadius={6}
            barFill={90}
            todayColor="#33A691"
            arrowColor="#33A691"
            ganttHeight={440}
            viewMode={ViewMode.Day}
          />
        </div>
      </div>
    </div>
  );
}
