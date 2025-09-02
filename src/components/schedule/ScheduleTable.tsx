/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowModesModel,
  GridRowModes,
  GridRowId,
  GridRowModel,
  GridEventListener,
} from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Close";
import { esES } from "@mui/x-data-grid/locales";
import { useEffect, useState } from "react";
import { GridRenderEditCellParams } from "@mui/x-data-grid";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField, MenuItem } from "@mui/material";
import dayjs from "dayjs";

// Interfaz para la tabla
export interface ScheduleTask {
  id: number;
  nombre_tarea: string;
  fecha_comienzo: string; // "YYYY-MM-DD"
  fecha_fin: string;
  duracion?: number;
  estado?: string;
  responsable?: string;
  progreso?: number;
  observaciones?: string;
  predecesoras?: string;
  cicloId: number;
  sedeId?: number;
  institucionId?: number;
  parentId?: number | null | string;
  isNew?: boolean; // (solo frontend)
}

interface ScheduleTableProps {
  tasks: ScheduleTask[];
  setTasks: React.Dispatch<React.SetStateAction<ScheduleTask[]>>;
  cicloId: number;
}

// Función auxiliar para sangría visual (profundidad de jerarquía)
function getNivelTarea(row: ScheduleTask, allTasks: ScheduleTask[]): number {
  let nivel = 0;
  let actual = row;
  while (
    actual.parentId !== undefined &&
    actual.parentId !== null &&
    actual.parentId !== "" &&
    actual.parentId !== "null"
  ) {
    const parent = allTasks.find((t) => t.id === Number(actual.parentId));
    if (!parent) break;
    nivel++;
    actual = parent;
  }
  return nivel;
}

export default function ScheduleTable({
  tasks,
  setTasks,
  cicloId,
}: ScheduleTableProps) {
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const handleAddClick = () => {
    const id = tasks.length ? Math.max(...tasks.map((r) => r.id)) + 1 : 1;

    setTasks((oldRows) => [
      ...oldRows,
      {
        id,
        nombre_tarea: "",
        fecha_comienzo: "",
        fecha_fin: "",
        duracion: 0,
        estado: "",
        responsable: "",
        progreso: 0,
        observaciones: "",
        predecesoras: "",
        cicloId,
        isNew: true,
        parentId: undefined,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit },
    }));
  };

  const handleRowEditStart: GridEventListener<"rowEditStart"> = (_, event) => {
    event.defaultMuiPrevented = true;
  };
  const handleRowEditStop: GridEventListener<"rowEditStop"> = (_, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleEditClick = (id: GridRowId) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };
  const handleCancelClick = (id: GridRowId) => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
    setTasks((oldRows) => oldRows.filter((row) => row.id !== id || !row.isNew));
  };
  const handleSaveClick = (id: GridRowId) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };
  const handleDeleteClick = (id: GridRowId) => {
    setTasks((oldRows) => oldRows.filter((row) => row.id !== id));
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    let duracion = newRow.duracion;
    if (newRow.fecha_comienzo && newRow.fecha_fin) {
      const inicio = dayjs(newRow.fecha_comienzo);
      const fin = dayjs(newRow.fecha_fin);
      duracion = fin.diff(inicio, "day") + 1;
    }

    const parentIdNormalized =
      newRow.parentId === "" ||
      newRow.parentId === "null" ||
      newRow.parentId === null
        ? null
        : Number(newRow.parentId);

    const rowWithDuration = {
      ...newRow,
      duracion,
      cicloId,
      parentId: Number.isNaN(parentIdNormalized) ? null : parentIdNormalized,
    };

    try {
      const savedRow = await guardarTarea(rowWithDuration as ScheduleTask);
      setTasks((oldRows) =>
        oldRows.map((row) =>
          row.id === newRow.id
            ? { ...savedRow, id: Number(savedRow.id), isNew: false }
            : row
        )
      );

      return { ...savedRow, isNew: false };
    } catch {
      alert("Error guardando la tarea. Intenta de nuevo.");
      return newRow;
    }
  };

  // Editor de fechas
  const DateEditCell = (props: GridRenderEditCellParams) => {
    const { id, field, value, api } = props;
    const handleChange = (newValue: dayjs.Dayjs | null) => {
      api.setEditCellValue({
        id,
        field,
        value: newValue ? dayjs(newValue).format("YYYY-MM-DD") : "",
      });
    };
    return (
      <DatePicker
        value={value ? dayjs(value) : null}
        onChange={handleChange}
        slotProps={{ textField: { size: "small", fullWidth: true } }}
      />
    );
  };

  // Editor de estado
  const EstadoEditCell = (props: GridRenderEditCellParams) => {
    const { id, field, value, api } = props;
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      api.setEditCellValue({
        id,
        field,
        value: event.target.value || "",
      });
    };

    return (
      <TextField
        select
        size="small"
        value={value || ""}
        onChange={handleChange}
        fullWidth
      >
        <MenuItem value="Pendiente">Pendiente</MenuItem>
        <MenuItem value="En progreso">En progreso</MenuItem>
        <MenuItem value="Finalizado">Finalizado</MenuItem>
      </TextField>
    );
  };

  // Opciones para el campo padre (excluye la fila actual para evitar ciclos)
  const parentOptions = tasks.map((t) => ({
    value: t.id,
    label: t.nombre_tarea,
  }));

  // Editor de padre
  const ParentEditCell = (props: GridRenderEditCellParams) => {
    const { id, field, value, api } = props;
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const v = event.target.value;
      api.setEditCellValue({
        id,
        field,
        value: v === "" ? null : Number(v), // <-- null para limpiar
      });
    };
    // Excluye la fila actual de las opciones para evitar que una tarea sea su propio padre
    const filteredParentOptions = parentOptions.filter(
      (opt) => opt.value !== id
    );

    return (
      <TextField
        select
        size="small"
        value={value ?? ""}
        onChange={handleChange}
        fullWidth
      >
        <MenuItem value="">Ninguno</MenuItem>
        {filteredParentOptions.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>
    );
  };
  // Columna padre formateada
  const parentValueFormatter = (params: any) => {
    const v = params?.value;
    if (v === undefined || v === null || v === "" || v === "null") return "";
    const padre = tasks.find((t) => t.id === Number(v));
    return padre ? padre.nombre_tarea : "";
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 60,
      editable: false,
      type: "number",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "nombre_tarea",
      headerName: "Actividad",
      width: 170,
      editable: true,
      renderCell: (params) => {
        // params.row siempre refleja el valor actual
        const nivel = getNivelTarea(params.row, tasks);
        return <span style={{ paddingLeft: nivel * 18 }}>{params.value}</span>;
      },
    },

    {
      field: "parentId",
      headerName: "Madre",
      width: 110,
      editable: true,
      renderEditCell: (params) => <ParentEditCell {...params} />,
      valueFormatter: parentValueFormatter,
    },
    {
      field: "fecha_comienzo",
      headerName: "Inicio",
      width: 100,
      editable: true,
      renderEditCell: (params) => <DateEditCell {...params} />,
    },
    {
      field: "fecha_fin",
      headerName: "Fin",
      width: 100,
      editable: true,
      renderEditCell: (params) => <DateEditCell {...params} />,
    },
    {
      field: "duracion",
      headerName: "Duración",
      width: 100,
      editable: false,
      type: "number",
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 110,
      editable: true,
      renderEditCell: (params) => <EstadoEditCell {...params} />,
    },
    {
      field: "responsable",
      headerName: "Responsable",
      width: 130,
      editable: true,
    },
    {
      field: "progreso",
      headerName: "Progreso (%)",
      width: 120,
      editable: true,
      type: "number",
    },
    {
      field: "predecesoras",
      headerName: "Predecesoras",
      width: 100,
      editable: true,
    },
    {
      field: "observaciones",
      headerName: "Observaciones",
      flex: 1,
      editable: true,
    },
    {
      field: "acciones",
      type: "actions",
      headerName: "Acciones",
      width: 120,
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        return isInEditMode
          ? [
              <GridActionsCellItem
                icon={<SaveIcon />}
                label="Guardar"
                onClick={() => handleSaveClick(id)}
                key="save"
              />,
              <GridActionsCellItem
                icon={<CancelIcon />}
                label="Cancelar"
                onClick={() => handleCancelClick(id)}
                key="cancel"
              />,
            ]
          : [
              <GridActionsCellItem
                icon={<EditIcon />}
                label="Editar"
                onClick={() => handleEditClick(id)}
                key="edit"
              />,
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Eliminar"
                onClick={() => handleDeleteClick(id)}
                key="delete"
              />,
            ];
      },
    },
  ];

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // TODO: agrega el campo parentId en el fetch/save si usas backend
  const guardarTarea = async (row: ScheduleTask) => {
    // Solo los campos que tu backend acepta:
    const {
      id,
      nombre_tarea,
      fecha_comienzo,
      fecha_fin,
      duracion,
      estado,
      responsable,
      progreso,
      observaciones,
      predecesoras,
      cicloId,
      sedeId,
      institucionId,
      parentId,
    } = row;

    const rowToSend = {
      nombre_tarea,
      fecha_comienzo,
      fecha_fin,
      duracion,
      estado,
      responsable,
      progreso,
      observaciones,
      predecesoras,
      cicloId,
      sedeId,
      institucionId,
      parentId: (parentId === undefined || parentId === ""
        ? null
        : parentId) as number | null,
    };

    if (row.isNew) {
      const resp = await fetch("http://localhost:3001/schedule-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rowToSend),
      });
      if (!resp.ok) throw new Error("Error al guardar tarea");
      const saved = await resp.json();
      return { ...saved, isNew: false };
    } else {
      const resp = await fetch(`http://localhost:3001/schedule-tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rowToSend),
      });
      if (!resp.ok) throw new Error("Error al actualizar tarea");
      const updated = await resp.json();
      return updated;
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {mounted && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <>
            <DataGrid
              autoHeight
              rows={tasks}
              columns={columns}
              editMode="row"
              rowModesModel={rowModesModel}
              onRowModesModelChange={setRowModesModel}
              onRowEditStart={handleRowEditStart}
              onRowEditStop={handleRowEditStop}
              processRowUpdate={processRowUpdate}
              getRowId={(row) => Number(row.id)}
              pageSizeOptions={[5, 10, 20]}
              localeText={esES.components.MuiDataGrid.defaultProps.localeText}
              sx={{
                borderRadius: "1rem",
                fontSize: 14,
                color: "#ffff",
                padding: "0.5rem",
                ".MuiDataGrid-columnHeaders": {
                  backgroundColor: "#2C5959",
                },
                ".MuiDataGrid-columnHeaderTitle": {
                  color: "#000 !important",
                  fontWeight: "nunito",
                  fontSize: "1rem",
                  fontFamily: "Nunito, sans-serif",
                },
                ".MuiDataGrid-cell": {
                  color: "#000",
                },
                ".MuiInputBase-input": {
                  color: "#000 !important",
                },
              }}
            />
            <button
              onClick={handleAddClick}
              style={{
                marginTop: 10,
                backgroundColor: "#2C5959",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "6px",
              }}
            >
              + Nueva Actividad
            </button>
          </>
        </LocalizationProvider>
      )}
    </div>
  );
}
