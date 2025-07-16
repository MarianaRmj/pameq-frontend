/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, FormEvent } from "react";
import Image from "next/image";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    try {
      const res = await fetch(`${API_URL}/recover/request-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al enviar correo");

      setSuccess("📧 Revisa tu correo para restablecer la contraseña.");
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex items-center justify-centerpx-4 font-nunito">
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
            Recuperar contraseña
          </h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            Ingresa tu correo para recibir un enlace de recuperación.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block font-semibold text-neutral-800 mb-1">
            Correo electrónico
            <input
              type="email"
              className="w-full mt-1 p-2 rounded-xl border border-gray-300 bg-neutral-100 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-xl font-semibold transition shadow disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} PAMEQ - Plataforma de Mejoramiento en Calidad
        </div>
      </div>
    </div>
  );
}
