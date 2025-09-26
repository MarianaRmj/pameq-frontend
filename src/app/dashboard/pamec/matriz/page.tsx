"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/app/lib/api";
import PriorizacionStyledTable from "@/components/matriz_priori/PriorizacionStyledTable";
import { PriorizacionRow } from "@/components/matriz_priori/PriorizacionStyledTable";

type Criterio = {
  id: number;
  dominio: "riesgo" | "costo" | "frecuencia";
  valor: 1 | 3 | 5;
  etiqueta: string;
};

type Proceso = { id: number; nombre_proceso: string }; // si tu backend devuelve 'nombre', cambia aquí y en el render

export default function MatrizPriorizacionPage() {
  const router = useRouter();
  const search = useSearchParams();

  // Query params
  const procesoIdFromUrl = useMemo(() => {
    const raw = search.get("procesoId");
    return raw ? parseInt(raw, 10) : NaN;
  }, [search]);
  const cicloIdFromUrl = useMemo(() => {
    const raw = search.get("cicloId");
    return raw ? parseInt(raw, 10) : undefined;
  }, [search]);

  const [procesoId, setProcesoId] = useState<number | null>(null);
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [rows, setRows] = useState<PriorizacionRow[]>([]);
  const [criterios, setCriterios] = useState<{
    riesgo: Criterio[];
    costo: Criterio[];
    frecuencia: Criterio[];
  }>({
    riesgo: [],
    costo: [],
    frecuencia: [],
  });
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Resolver procesoId inicial: URL -> sessionStorage -> null
  useEffect(() => {
    if (!Number.isNaN(procesoIdFromUrl)) {
      setProcesoId(procesoIdFromUrl);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("procesoIdSeleccion", String(procesoIdFromUrl));
      }
      return;
    }
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("procesoIdSeleccion");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!Number.isNaN(parsed)) {
          router.replace(
            `?procesoId=${parsed}${
              cicloIdFromUrl ? `&cicloId=${cicloIdFromUrl}` : ""
            }`
          );
          return;
        }
      }
    }
    setProcesoId(null);
  }, [procesoIdFromUrl, cicloIdFromUrl, router]);

  // Catálogos (desplegables)
  useEffect(() => {
    api<{
      riesgo: Criterio[];
      costo: Criterio[];
      frecuencia: Criterio[];
    }>("/matriz-priorizacion/criterios")
      .then(setCriterios)
      .catch(() => toast.error("No se pudieron cargar los criterios"));
  }, []);

  // Procesos seleccionados (solo si no hay procesoId)
  useEffect(() => {
    if (procesoId !== null) return;
    (async () => {
      try {
        const qs = cicloIdFromUrl ? `?cicloId=${cicloIdFromUrl}` : "";
        // 🔸 ahora le pegamos a la ruta que solo devuelve procesos con check
        const list = await api<Proceso[]>(
          `/matriz-priorizacion/procesos-seleccionados${qs}`
        );
        setProcesos(list);
      } catch {
        // noop
      }
    })();
  }, [procesoId, cicloIdFromUrl]);

  // Cargar matriz del proceso
  useEffect(() => {
    const run = async () => {
      if (!procesoId || Number.isNaN(procesoId)) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const qs = cicloIdFromUrl ? `?cicloId=${cicloIdFromUrl}` : "";
        type MatrizApiRow = {
          estandar_id?: number;
          estandarId?: number;
          codigo: string;
          descripcion: string;
          fortalezas?: string[];
          oportunidades?: string[];
          riesgo?: number | null;
          costo?: number | null;
          frecuencia?: number | null;
          total?: number | null;
          confirmado?: boolean;
        };

        const data = await api<MatrizApiRow[]>(
          `/matriz-priorizacion/matriz/${procesoId}${qs}`
        );
        const mapped = data
          .map((r) => {
            const estandarId = r.estandar_id ?? r.estandarId;
            if (typeof estandarId !== "number") return null;
            return {
              estandarId,
              codigo: r.codigo,
              descripcion: r.descripcion,
              fortalezas: Array.isArray(r.fortalezas) ? r.fortalezas : [],
              oportunidades: Array.isArray(r.oportunidades) ? r.oportunidades : [],
              riesgo: r.riesgo ?? null,
              costo: r.costo ?? null,
              frecuencia: r.frecuencia ?? null,
              total: r.total ?? null,
              confirmado: !!r.confirmado,
            } as PriorizacionRow;
          })
          .filter((row): row is PriorizacionRow => row !== null);
        setRows(mapped);
      } catch (err: unknown) {
        // Si el backend lanza 403 cuando el proceso no está seleccionado:
        let msg: string = "";
        if (err instanceof Error) {
          msg = err.message;
        } else if (typeof err === "string") {
          msg = err;
        } else {
          msg = String(err);
        }
        if (msg?.includes("403") || msg?.toLowerCase().includes("forbidden")) {
          toast.error(
            "Este proceso no está seleccionado para el ciclo actual. Márquelo en Selección de Procesos."
          );
          setRows([]);
        } else {
          toast.error(
            "No se pudo cargar la matriz de priorización del proceso"
          );
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [procesoId, cicloIdFromUrl]);

  // Guardar cambio de un select
  const onChange = async (
    estandarId: number,
    field: "riesgo" | "costo" | "frecuencia",
    value: 1 | 3 | 5
  ) => {
    if (!procesoId) return;
    const current = rows.find((x) => x.estandarId === estandarId);
    if (!current) return;

    // Optimistic UI
    const prev = [...rows];
    const calcTotal = (
      ri?: number | null,
      co?: number | null,
      fr?: number | null
    ) => (ri && co && fr ? ri * co * fr : null);

    const updated = rows.map((x) =>
      x.estandarId === estandarId
        ? {
            ...x,
            [field]: value,
            total: calcTotal(
              field === "riesgo" ? value : x.riesgo,
              field === "costo" ? value : x.costo,
              field === "frecuencia" ? value : x.frecuencia
            ),
          }
        : x
    );
    setRows(updated);
    setSaving((s) => ({ ...s, [estandarId]: true }));

    try {
      await api("/matriz-priorizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          procesoId,
          estandarId,
          riesgo: (field === "riesgo" ? value : current.riesgo) ?? 1,
          costo: (field === "costo" ? value : current.costo) ?? 1,
          frecuencia:
            (field === "frecuencia" ? value : current.frecuencia) ?? 1,
        }),
      });
    } catch {
      toast.error("No se pudo guardar la priorización");
      setRows(prev);
    } finally {
      setSaving((s) => ({ ...s, [estandarId]: false }));
    }
  };

  // Render
  if (loading && procesoId !== null) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2 text-[#2C5959]">
          Matriz de Priorización
        </h2>
        <p className="text-gray-600">Cargando…</p>
      </div>
    );
  }

  if (procesoId === null) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 text-[#2C5959]">
          Matriz de Priorización
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm max-w-xl">
          <label className="block text-sm text-gray-700 mb-2">
            Selecciona el proceso para cargar la matriz:
          </label>
          <div className="flex gap-2">
            <select
              className="w-full border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2C5959] bg-white"
              defaultValue=""
              onChange={(e) => {
                const id = parseInt(e.target.value, 10);
                if (!Number.isNaN(id)) {
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem("procesoIdSeleccion", String(id));
                  }
                  router.replace(
                    `?procesoId=${id}${
                      cicloIdFromUrl ? `&cicloId=${cicloIdFromUrl}` : ""
                    }`
                  );
                }
              }}
            >
              <option value="" disabled>
                Selecciona…
              </option>
              {procesos.map((p) => (
                <option key={p.id} value={p.id}>
                  {
                    p.nombre_proceso /* si tu backend devuelve 'nombre', usa p.nombre */
                  }
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            También puedes entrar directo con la URL:&nbsp;
            <code className="bg-gray-100 px-1 py-0.5 rounded">
              /dashboard/matriz-priorizacion?procesoId=1
            </code>
            {cicloIdFromUrl ? (
              <>
                {" "}
                y{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">
                  cicloId={cicloIdFromUrl}
                </code>
              </>
            ) : null}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PriorizacionStyledTable
        rows={rows}
        criterios={criterios}
        saving={saving}
        onChange={onChange}
      />
    </div>
  );
}
