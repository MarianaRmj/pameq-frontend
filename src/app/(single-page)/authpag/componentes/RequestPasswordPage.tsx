/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

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
    <div className=" flex items-center justify-center bg-white font-nunito">
      <div className="w-full max-w-md p-8 md:p-10 bg-white rounded-3xl shadow-2xl border border-gray-200">
        {/* Mensajes */}
        {error && (
          <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-4 text-center font-nunito border border-red-300 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 rounded-lg p-3 mb-4 text-center font-nunito border border-green-300 text-sm">
            {success}
          </div>
        )}

        {/* Logo + encabezado */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/logo.png"
            alt="PAMEQ"
            width={120}
            height={120}
            className="mb-2 drop-shadow"
            style={{ filter: "grayscale(100%) brightness(1.1)" }}
          />
          <h2 className="text-2xl font-nunito text-[#2C5959] tracking-wide text-center">
            Recuperar contraseña
          </h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            Ingresa tu correo para recibir un enlace de recuperación.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-nunito text-neutral-800 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              className="w-full p-2 rounded-xl border border-gray-300 bg-neutral-100 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#2C5959] transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#2C5959] hover:bg-[#1f403f] text-white py-2 rounded-xl font-nunito transition shadow disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/login")}
            className="text-[#2C5959] text-sm hover:underline"
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
