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
  isNew?: boolean;
}

export default function ScheduleTable() {
  const [rows, setRows] = React.useState<ScheduleTask[]>([
    {
      id: 1,
      nombre_tarea: "Tarea inicial",
      descripcion: "Descripción inicial",
      fecha_comienzo: "2025-07-01",
      fecha_fin: "2025-07-05",
      duracion: 5,
      estado: "Pendiente",
      responsable: "Juan Perez",
      progreso: 0,
      observaciones: "",
    },
  ]);

  const handleAddClick = () => {
    const id = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        nombre_tarea: "",
        descripcion: "",
        fecha_comienzo: "",
        fecha_fin: "",
        duracion: 0,
        estado: "",
        responsable: "",
        progreso: 0,
        observaciones: "",
        isNew: true,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit },
    }));
  };

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  // Evita el comportamiento de edición por defecto
  const handleRowEditStart: GridEventListener<"rowEditStart"> = (
    params,
    event
  ) => {
    event.defaultMuiPrevented = true;
  };
  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
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
    setRows((oldRows) => oldRows.filter((row) => row.id !== id || !row.isNew));
  };

  const handleSaveClick = (id: GridRowId) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => {
    setRows((oldRows) => oldRows.filter((row) => row.id !== id));
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false } as ScheduleTask;
    setRows((oldRows) =>
      oldRows.map((row) => (row.id === updatedRow.id ? updatedRow : row))
    );
    return updatedRow;
  };

  const columns: GridColDef[] = [
    {
      field: "nombre_tarea",
      headerName: "Actividad",
      flex: 1,
      editable: true,
      renderHeader: () => (
        <strong style={{ color: "#000", fontWeight: "bold" }}>Actividad</strong>
      ),
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      flex: 1,
      editable: true,
      renderHeader: () => (
        <strong style={{ color: "#000", fontWeight: "bold" }}>
          Descripción
        </strong>
      ),
    },
    {
      field: "fecha_comienzo",
      headerName: "Inicio",
      width: 120,
      editable: true,
      renderHeader: () => (
        <strong style={{ color: "#000", fontWeight: "bold" }}>Inicio</strong>
      ),
    },
    {
      field: "fecha_fin",
      headerName: "Fin",
      width: 120,
      editable: true,
      renderHeader: () => (
        <strong style={{ color: "#000", fontWeight: "bold" }}>Fin</strong>
      ),
    },
    {
      field: "duracion",
      headerName: "Duración",
      width: 110,
      editable: true,
      type: "number",
      renderHeader: () => (
        <strong style={{ color: "#000", fontWeight: "bold" }}>Duración</strong>
      ),
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 130,
      editable: true,
      renderHeader: () => (
        <strong style={{ color: "#000", fontWeight: "bold" }}>Estado</strong>
      ),
    },
    {
      field: "responsable",
      headerName: "Responsable",
      width: 130,
      editable: true,
      renderHeader: () => (
        <strong style={{ color: "#000", fontWeight: "bold" }}>
          Responsable
        </strong>
      ),
    },
    {
      field: "progreso",
      headerName: "Progreso (%)",
      width: 120,
      editable: true,
      type: "number",
      renderHeader: () => (
        <strong style={{ color: "#000", fontWeight: "bold" }}>
          Progreso (%)
        </strong>
      ),
    },
    {
      field: "acciones",
      type: "actions",
      headerName: "Acciones",
      width: 120,
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return [
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
          ];
        }
        return [
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
        <>
          <DataGrid
            autoHeight
            rows={rows}
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
              borderRadius: "1.2rem",
              fontSize: 16,
              color: "#000",
              ".MuiDataGrid-columnHeaders": {
                backgroundColor: "#2C5959",
              },
              ".MuiDataGrid-columnHeaderTitle": {
                color: "#fff !important",
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
      )}
    </div>
  );
}
