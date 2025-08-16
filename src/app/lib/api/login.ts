// src/lib/api/login.ts
export async function login(email: string, password: string) {
  const res = await fetch("http://localhost:3001/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al iniciar sesión");
  }

  return res.json(); // { token, usuario }
}
