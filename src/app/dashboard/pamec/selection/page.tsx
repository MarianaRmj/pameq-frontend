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

  const [cicloId, setCicloId] = useState<number | null>(null); // ID (ej. 1)
  const [cicloYear, setCicloYear] = useState<number | null>(null); // AÑO (ej. 2025)

  const [procesos, setProcesos] = useState<RecuentoProceso[]>([]);
  const [estandares, setEstandares] = useState<EstandarConOportunidad[]>([]);
  const [loading, setLoading] = useState(true);

  const [selecciones, setSelecciones] = useState<
    Record<number, { seleccion: boolean; observaciones: string }>
  >({});
  const [guardados, setGuardados] = useState<Record<number, boolean>>({});

  // 1) Traer ciclo ACTIVO (id + fecha_inicio para sacar el año)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const activo = await api<{ id: number; fecha_inicio: string }>(
          "/cycles/active"
        );
        if (!mounted) return;
        setCicloId(activo.id);
        setCicloYear(Number(activo.fecha_inicio.slice(0, 4)));
      } catch (err) {
        console.error("❌ Error obteniendo ciclo activo:", err);
        toast.error("No se pudo obtener el ciclo activo");
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 2) Con cicloId (ID) y cicloYear (AÑO) listos, cargar datos
  useEffect(() => {
    if (cicloId == null || cicloYear == null) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        // ID → recuento y seleccionados
        const [recuento, seleccionados] = await Promise.all([
          api<RecuentoProceso[]>(`/processes/recuento/${cicloId}`),
          api<SeleccionGuardada[]>(`/processes/seleccionados/${cicloId}`),
        ]);

        // AÑO → estándares con oportunidades
        const estandaresResp = await api<EstandarConOportunidad[]>(
          `/autoevaluaciones/${cicloYear}/oportunidades`
        );

        if (!mounted) return;

        // Inicializar estado local
        const initSelecciones: Record<
          number,
          { seleccion: boolean; observaciones: string }
        > = {};
        const initGuardados: Record<number, boolean> = {};

        recuento.forEach((r) => {
          const saved = seleccionados.find((s) => s.proceso.id === r.id);
          initSelecciones[r.id] = {
            seleccion: !!saved?.seleccionado,
            observaciones: saved?.observaciones || "",
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
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [cicloId, cicloYear]);

  const handleChange = (
    procesoId: number,
    field: "seleccion" | "observaciones",
    value: boolean | string
  ) => {
    setSelecciones((prev) => ({
      ...prev,
      [procesoId]: {
        ...(prev[procesoId] ?? { seleccion: false, observaciones: "" }),
        [field]: field === "seleccion" ? Boolean(value) : String(value),
      },
    }));
    setGuardados((prev) => ({ ...prev, [procesoId]: false }));
  };

  // El backend usa el ciclo ACTIVO global; no mandamos cicloId
  const handleSave = (row: RecuentoProceso) => {
    const { seleccion, observaciones } = selecciones[row.id] || {
      seleccion: false,
      observaciones: "",
    };
    if (seleccion && !observaciones.trim()) {
      toast.error("Debes ingresar observaciones si marcas selección.");
      return;
    }

    confirm(
      `¿Confirmas guardar la selección para el proceso "${row.proceso}"?`,
      async () => {
        try {
          await api("/processes/seleccion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              procesoId: row.id,
              usuarioId: 5, // TODO: sesión real
              seleccionado: !!seleccion,
              observaciones: observaciones ?? "",
            }),
          });
          toast.success(`Selección guardada para ${row.proceso}`);
          setGuardados((prev) => ({ ...prev, [row.id]: true }));
        } catch (e) {
          console.error(e);
          toast.error("Error al guardar selección");
        }
      }
    );
  };

  if (loading || cicloId == null || cicloYear == null)
    return <p className="p-4">Cargando...</p>;

  return (
    <div className="p-6 space-y-10">
      <ProcessesTable
        data={procesos}
        selecciones={selecciones}
        guardados={guardados}
        onChange={handleChange}
        onSave={handleSave}
      />
      <StandardsTable estandares={estandares} selecciones={selecciones} />
      <ConfirmModal />
    </div>
  );
}
