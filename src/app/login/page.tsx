/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, FormEvent } from "react";
import Link from "next/link";
  import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [usuario, setUsuario] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(usuario, password); // usa la función del contexto
      window.location.href = "/dashboard"; // o router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-nunito">
      <div className="w-full max-w-md p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-200">
        {/* Logo y título */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo.png"
            alt="PAMEQ"
            className="w-28 mb-2 drop-shadow"
            style={{ filter: "grayscale(100%) brightness(1.1)" }}
          />
          <h2 className="text-2xl font-nunito text-[#2C5959] tracking-wide text-center">
            ¡Bienvenido a PAMEQ!
          </h2>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-4 text-center font-nunito border border-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-nunito text-neutral-800 mb-1">
              Usuario
            </label>
            <input
              type="text"
              className="w-full p-2 rounded-xl border border-gray-300 bg-neutral-100 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2C5959] transition"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block font-nunito text-neutral-800 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full p-2 rounded-xl border border-gray-300 bg-neutral-100 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2C5959] transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#2C5959] hover:bg-[#1f403f] text-white py-2 rounded-xl font-nunito transition shadow disabled:opacity-60"
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Recuperar contraseña */}
        <div className="mt-5 text-sm text-center">
          <Link
            href="/recover/reset-password"
            className="text-[#2C5959] hover:underline hover:text-emerald-900 transition"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Pie de página */}
        <div className="mt-6 text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} PAMEQ - Plataforma de Mejoramiento en
          Calidad
        </div>
      </div>
    </div>
  );
}
