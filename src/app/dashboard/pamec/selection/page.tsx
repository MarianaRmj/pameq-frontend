"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/useConfirm";

import {
  RecuentoProceso,
  SeleccionGuardada,
  EstandarConOportunidad,
} from "./type";

import ProcessesTable from "./ProcessesTable";
import StandardsTable from "./StandardsTable";

export default function SelectionPage() {
  const { confirm, ConfirmModal } = useConfirm();
  const cicloId = 2025;

  const [procesos, setProcesos] = useState<RecuentoProceso[]>([]);
  const [estandares, setEstandares] = useState<EstandarConOportunidad[]>([]);
  const [loading, setLoading] = useState(true);

  const [selecciones, setSelecciones] = useState<
    Record<number, { seleccion: boolean; observaciones: string }>
  >({});
  const [guardados, setGuardados] = useState<Record<number, boolean>>({});

  // 📌 Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Procesos con recuento de oportunidades
        const recuento = await api<RecuentoProceso[]>(
          `/processes/recuento/${cicloId}`
        );

        // Procesos ya seleccionados en BD
        const seleccionados = await api<SeleccionGuardada[]>(
          `/processes/seleccionados/${cicloId}`
        );

        // Estándares con oportunidades de mejora
        const estandaresResp = await api<EstandarConOportunidad[]>(
          `/autoevaluaciones/${cicloId}/oportunidades`
        );

        // Inicializar estado local
        const initSelecciones: Record<
          number,
          { seleccion: boolean; observaciones: string }
        > = {};
        const initGuardados: Record<number, boolean> = {};

        recuento.forEach((r) => {
          const saved = seleccionados.find((s) => s.proceso.id === r.id);
          initSelecciones[r.id] = {
            seleccion: saved ? saved.seleccionado : false,
            observaciones: saved ? saved.observaciones : "",
          };
          if (saved) initGuardados[r.id] = true;
        });

        setProcesos(recuento);
        setEstandares(estandaresResp);
        setSelecciones(initSelecciones);
        setGuardados(initGuardados);
      } catch (err) {
        console.error("❌ Error cargando datos:", err);
        toast.error("Error cargando datos de selección de procesos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cicloId]);

  // 📌 Cambios en selección / observaciones
  const handleChange = (
    procesoId: number,
    field: "seleccion" | "observaciones",
    value: boolean | string
  ) => {
    setSelecciones((prev) => ({
      ...prev,
      [procesoId]: { ...prev[procesoId], [field]: value },
    }));
    setGuardados((prev) => ({ ...prev, [procesoId]: false }));
  };

  // 📌 Guardar selección en BD
  const handleSave = (row: RecuentoProceso) => {
    const { seleccion, observaciones } = selecciones[row.id] || {};
    if (seleccion && !observaciones.trim()) {
      toast.error("Debes ingresar observaciones si marcas selección.");
      return;
    }

    confirm(
      `¿Confirmas guardar la selección para el proceso "${row.proceso}"?`,
      async () => {
        const payload = {
          procesoId: row.id,
          usuarioId: 5, // TODO: traer de sesión real
          seleccion,
          observaciones,
        };

        try {
          await api("/processes/seleccion", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          toast.success(`Selección guardada para ${row.proceso}`);
          setGuardados((prev) => ({ ...prev, [row.id]: true }));
        } catch {
          toast.error("Error al guardar selección");
        }
      }
    );
  };

  if (loading) return <p className="p-4">Cargando...</p>;

  return (
    <div className="p-6 space-y-10">
      {/* 📌 Tabla de Procesos */}
      <ProcessesTable
        data={procesos}
        selecciones={selecciones}
        guardados={guardados}
        onChange={handleChange}
        onSave={handleSave}
      />

      {/* 📌 Tabla de Estándares con Oportunidades */}
      <StandardsTable estandares={estandares} selecciones={selecciones} />

      {/* 📌 Modal de confirmación */}
      <ConfirmModal />
    </div>
  );
}
