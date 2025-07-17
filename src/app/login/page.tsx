/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, FormEvent } from "react";
import Link from "next/link";

export default function Login() {
  const [usuario, setUsuario] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Si backend espera { email, password }
        body: JSON.stringify({ email: usuario, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error de autenticación");

      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200">
        {error && (
          <div className="bg-red-100 text-red-700 rounded p-3 mb-4 text-center font-semibold border border-red-200">
            {error}
          </div>
        )}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo.png"
            alt="PAMEQ"
            className="w-30 mb-2 drop-shadow-lg"
            style={{ filter: "grayscale(100%) brightness(1.1)" }}
          />
          <h2 className="text-2xl font-bold text-neutral-900 tracking-wide">
            ¡Bienvenido a PAMEQ!
          </h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block font-semibold text-neutral-800 mb-1">
            Usuario
            <input
              type="text"
              className="w-full mt-1 p-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-900 bg-neutral-100 transition"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
          </label>
          <label className="block font-semibold text-neutral-800 mb-1">
            Contraseña
            <input
              type="password"
              className="w-full mt-1 p-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-900 bg-neutral-100 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#2C5959] hover:bg-emerald-800 text-white py-2 rounded-xl font-semibold transition shadow"
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>
        <div className="mt-5 flex flex-col gap-1 text-sm text-center">
          <Link
            href="/recover/reset-password"
            className="text-emerald-700 hover:underline hover:text-emerald-900 transition"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="mt-6 text-xs text-gray-400 text-center">
          <span>
            © {new Date().getFullYear()} PAMEQ - Plataforma de Mejoramiento en
            Calidad
          </span>
        </div>
      </div>
    </div>
  );
}
