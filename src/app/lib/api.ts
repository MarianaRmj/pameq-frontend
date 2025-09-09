// app/lib/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL; // ej: http://77.37.41.104:3001

export async function api<T = unknown>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, ""); // sin slash al final
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const r = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  });

  const ct = r.headers.get("content-type") || "";
  const payload = ct.includes("application/json")
    ? await r.json().catch(() => ({}))
    : await r.text();

  if (!r.ok) {
    const detail =
      typeof payload === "string"
        ? payload.slice(0, 800)
        : JSON.stringify(payload);
    throw new Error(`Fetch ${r.status} ${r.statusText} → ${url}\n${detail}`);
  }

  return payload as T;
}
