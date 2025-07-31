"use client";

import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";

const rows = [{ id: 1, col1: "Hola", col2: "Mundo" }];
const columns = [
  { field: "col1", headerName: "Columna 1", width: 150 },
  { field: "col2", headerName: "Columna 2", width: 150 },
];

export default function TestPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", padding: "2rem" }}>
      <div style={{ width: "100%", border: "2px dashed red" }}>
        {mounted && <DataGrid autoHeight rows={rows} columns={columns} />}
      </div>
    </div>
  );
}
