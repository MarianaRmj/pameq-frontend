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

// Interfaz para la tabla y para el SchedulePage
export interface ScheduleTask {
  id: number;
  nombre_tarea: string;
  descripcion?: string;
  fecha_comienzo: string;
  fecha_fin: string;
  duracion?: number;
  estado?: string;
  responsable?: string;
  progreso?: number;
  observaciones?: string;
  predecesoras?: string;
  isNew?: boolean;
}

interface ScheduleTableProps {
  tasks: ScheduleTask[];
  setTasks: React.Dispatch<React.SetStateAction<ScheduleTask[]>>;
}

export default function ScheduleTable({ tasks, setTasks }: ScheduleTableProps) {
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const handleAddClick = () => {
    const id = tasks.length ? Math.max(...tasks.map((r) => r.id)) + 1 : 1;
    const today = dayjs().format("YYYY-MM-DD");
    const fin = dayjs().add(2, "day").format("YYYY-MM-DD");

    setTasks((oldRows) => [
      ...oldRows,
      {
        id,
        nombre_tarea: "",
        descripcion: "",
        fecha_comienzo: today,
        fecha_fin: fin,
        duracion: 2,
        estado: "",
        responsable: "",
        progreso: 0,
        observaciones: "",
        predecesoras: "",
        isNew: true,
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

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false } as ScheduleTask;
    setTasks((oldRows) =>
      oldRows.map((row) => (row.id === updatedRow.id ? updatedRow : row))
    );
    return updatedRow;
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
      api.setEditCellValue({ id, field, value: event.target.value });
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

  const columns: GridColDef[] = [
    { field: "nombre_tarea", headerName: "Actividad", flex: 1, editable: true },
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 1,
      editable: true,
    },
    {
      field: "fecha_comienzo",
      headerName: "Inicio",
      width: 120,
      editable: true,
      renderEditCell: (params) => <DateEditCell {...params} />,
    },
    {
      field: "fecha_fin",
      headerName: "Fin",
      width: 120,
      editable: true,
      renderEditCell: (params) => <DateEditCell {...params} />,
    },
    {
      field: "duracion",
      headerName: "Duración",
      width: 110,
      editable: true,
      type: "number",
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 130,
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
              getRowId={(row) => row.id}
              pageSizeOptions={[5, 10, 20]}
              localeText={esES.components.MuiDataGrid.defaultProps.localeText}
              sx={{
                borderRadius: "1.1rem",
                fontSize: 16,
                color: "#000",
                ".MuiDataGrid-columnHeaders": {
                  backgroundColor: "#2C5959",
                },
                ".MuiDataGrid-columnHeaderTitle": {
                  color: "#000 !important",
                  fontWeight: "bold",
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
              + Nueva Fila
            </button>
          </>
        </LocalizationProvider>
      )}
    </div>
  );
}
