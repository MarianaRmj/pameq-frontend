"use client";

import { ChevronUp, ChevronDown } from "lucide-react";

interface Props {
  mostrarCriterios: boolean;
  setMostrarCriterios: (v: boolean) => void;
  criterios: string[];
}

export default function CriteriosToggle({
  mostrarCriterios,
  setMostrarCriterios,
  criterios,
}: Props) {
  return (
    <div className="mb-8 font-nunito">
      {/* Encabezado con botón */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h4 className="text-lg font-nunito text-verdeOscuro mb-2">
          Criterios del Estándar
        </h4>

        <button
          type="button"
          onClick={() => setMostrarCriterios(!mostrarCriterios)}
          className="text-sm flex items-center gap-1 text-verdeOscuro hover:text-verdeClaro transition"
        >
          {mostrarCriterios ? (
            <>
              Ocultar <ChevronUp size={16} />
            </>
          ) : (
            <>
              Mostrar <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>

      {/* Lista de criterios */}
      {mostrarCriterios && (
        <ol className="list-decimal pl-6 mt-4 space-y-3 text-gray-800 text-justify text-sm leading-relaxed">
          {criterios.map((c, i) => (
            <li key={i} className="marker:text-verdeOscuro">
              {c}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
