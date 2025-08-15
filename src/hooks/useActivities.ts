// app/dashboard/activities/hooks/useActivities.ts
"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import type { Activity, Process } from "@/app/dashboard/activities/types";

export function useActivities() {
  const [items, setItems] = useState<Activity[]>([]);
  const [procesos, setProcesos] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [list, procs] = await Promise.all([
      api<Activity[]>("/activities"),
      api<Process[]>("/activities/catalog/processes").catch(() => []),
    ]);
    setItems(list);
    setProcesos(procs);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = useCallback(async (id: number) => {
    await api(`/activities/${id}`, { method: "DELETE" });
    await load();
  }, [load]);

  return { items, procesos, loading, load, remove };
}
