// src/components/instituciones/InstitucionFormFields.tsx
import React from "react";
import { InstitutionForm } from "./types";

interface Props {
  formData: InstitutionForm;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const InstitucionFormFields = ({ formData, handleChange }: Props) => {
  const camposTexto = [
    "nombre_ips",
    "nit",
    "direccion_principal",
    "telefono",
    "codigo_habilitacion",
    "nombre_representante",
    "correo_contacto",
  ];

  const selects = {
    enfoque: ["Mejoramiento De Procesos", "Gulas De Practica Clinica (GPC)", "Seguridad Del Paciente", "Acreditacion En Salud"],
    tipo_institucion: ["Publica", "Privada", "Mixta"],
    nivel_complejidad: ["Baja", "Media", "Alta"],
  };

  return (
    <>
      {camposTexto.map((name) => (
        <div key={name}>
          <label className="block mb-1 font-semibold capitalize text-verdeOscuro">
            {name.replace(/_/g, " ")}
          </label>
          <input
            name={name}
            value={formData[name as keyof InstitutionForm] || ""}
            onChange={handleChange}
            placeholder={`Ingrese ${name.replace(/_/g, " ")}`}
            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verdeClaro transition"
          />
        </div>
      ))}

      {Object.entries(selects).map(([key, options]) => (
        <div key={key}>
          <label className="block mb-1 font-semibold capitalize text-verdeOscuro">
            {key.replace(/_/g, " ")}
          </label>
          <select
            name={key}
            value={formData[key as keyof InstitutionForm] || ""}
            onChange={handleChange}
            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verdeClaro transition"
          >
            <option value="">Seleccione</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}
    </>
  );
};
