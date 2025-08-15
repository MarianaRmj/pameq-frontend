// app/lib/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL; // ej: http://77.37.41.104:3001

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  console.log("[api.ts] API_URL:", API_URL);

  const r = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(options?.headers || {}),
    },
    cache: "no-store",
    credentials: "include",
  });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}
