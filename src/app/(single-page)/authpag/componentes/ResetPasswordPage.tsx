/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/recover/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al cambiar contraseña");

      setSuccess("✅ Contraseña actualizada correctamente. Redirigiendo...");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 px-4 font-nunito">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200">

        {/* Mensajes */}
        {error && (
          <div className="bg-red-100 text-red-700 rounded p-3 mb-4 text-center font-semibold border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 rounded p-3 mb-4 text-center font-semibold border border-green-200">
            {success}
          </div>
        )}

        {/* Logo + Encabezado */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/logo.png"
            alt="PAMEQ"
            width={150}
            height={150}
            className="mb-2 drop-shadow-lg"
            style={{ filter: "grayscale(100%) brightness(1.1)" }}
          />
          <h2 className="text-xl font-bold text-neutral-900 tracking-wide mt-2">
            Restablecer contraseña
          </h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            Ingresa y confirma tu nueva contraseña para continuar.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleReset} className="space-y-4">
          <label className="block font-semibold text-neutral-800 mb-1">
            Nueva contraseña
            <input
              type="password"
              className="w-full mt-1 p-2 rounded-xl border border-gray-300 bg-neutral-100 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          <label className="block font-semibold text-neutral-800 mb-1">
            Confirmar contraseña
            <input
              type="password"
              className="w-full mt-1 p-2 rounded-xl border border-gray-300 bg-neutral-100 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-xl font-semibold transition shadow disabled:opacity-60"
          >
            {loading ? "Procesando..." : "Guardar nueva contraseña"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/login")}
            className="text-emerald-700 text-sm hover:underline"
          >
            Volver al inicio de sesión
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} PAMEQ - Plataforma de Mejoramiento en Calidad
        </div>
      </div>
    </div>
  );
}
