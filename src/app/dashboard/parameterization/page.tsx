"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditarInstitucion() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre_ips: "",
    nit: "",
    direccion_principal: "",
    telefono: "",
    codigo_habilitacion: "",
    tipo_institucion: "",
    nombre_representante: "",
    nivel_complejidad: "",
    correo_contacto: "",
    sitio_web: "",
    resolucion_habilitacion: "",
    enfoque: "",
    fecha_inicio_ciclo: "",
    fecha_fin_ciclo: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/institutions/1")
      .then((res) => res.json())
      .then((data) => {
        setFormData(data);
        setLoading(false);
      })
      .catch(() => {
        alert("Error cargando la institución");
        setLoading(false);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/institutions/1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      alert("✅ Institución actualizada");
      router.push("/dashboard");
    } catch (err) {
      alert(`❌ ${err}`);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-gray-600 font-nunito">Cargando datos...</div>
    );

  return (
  <section className="max-w-5xl mx-auto mt-10 px-6 py-10 bg-white rounded-2xl shadow-md font-nunito">
    <div className="mb-10 text-center">
      <h2 className="text-3xl font-extrabold text-[#2C5959] mb-2">
        Parametrizar Institución
      </h2>
      <p className="text-sm text-gray-500">
        Completa o actualiza la información general de tu institución
      </p>
    </div>

    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
    >
      {[
        { label: "Nombre de la IPS", name: "nombre_ips" },
        { label: "NIT", name: "nit" },
        { label: "Dirección Principal", name: "direccion_principal" },
        { label: "Teléfono", name: "telefono" },
        { label: "Código de Habilitación", name: "codigo_habilitacion" },
        { label: "Representante Legal", name: "nombre_representante" },
        { label: "Correo de Contacto", name: "correo_contacto" },
        { label: "Enfoque", name: "enfoque" },
      ].map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            {field.label}
          </label>
          <input
            name={field.name}
            value={formData[field.name as keyof typeof formData] || ""}
            onChange={handleChange}
            required={["nombre_ips", "nit", "direccion_principal"].includes(
              field.name
            )}
            className="w-full rounded-lg border border-gray-300 bg-neutral-100 px-4 py-2 text-sm focus:border-[#2C5959] focus:ring-2 focus:ring-[#2C5959] outline-none transition"
          />
        </div>
      ))}

      {/* Sección de Ciclo */}
      <div className="md:col-span-2">
        <div className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-[#2C5959] mb-3">Ciclo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                name="fecha_inicio_ciclo"
                value={formData.fecha_inicio_ciclo}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-[#2C5959] focus:ring-2 focus:ring-[#2C5959] outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fecha de Fin
              </label>
              <input
                type="date"
                name="fecha_fin_ciclo"
                value={formData.fecha_fin_ciclo}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-[#2C5959] focus:ring-2 focus:ring-[#2C5959] outline-none transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Selects */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Tipo de Institución
        </label>
        <select
          name="tipo_institucion"
          value={formData.tipo_institucion}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 bg-neutral-100 px-4 py-2 text-sm focus:border-[#2C5959] focus:ring-2 focus:ring-[#2C5959] outline-none transition"
        >
          <option value="">Seleccione</option>
          <option value="Publica">Pública</option>
          <option value="Privada">Privada</option>
          <option value="Mixta">Mixta</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Nivel de Complejidad
        </label>
        <select
          name="nivel_complejidad"
          value={formData.nivel_complejidad}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 bg-neutral-100 px-4 py-2 text-sm focus:border-[#2C5959] focus:ring-2 focus:ring-[#2C5959] outline-none transition"
        >
          <option value="">Seleccione</option>
          <option value="Baja">Baja</option>
          <option value="Media">Media</option>
          <option value="Alta">Alta</option>
        </select>
      </div>

      <div className="md:col-span-2 flex justify-end pt-4">
        <button
          type="submit"
          className="bg-[#2C5959] hover:bg-[#1f403f] text-white px-6 py-3 rounded-lg font-semibold text-sm transition"
        >
          Actualizar institución
        </button>
      </div>
    </form>
  </section>
);
}
