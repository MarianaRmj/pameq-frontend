"use client";

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
    <div className="mb-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h4 className="text-verdeOscuro font-semibold text-lg">Criterios</h4>
        <button
          type="button"
          onClick={() => setMostrarCriterios(!mostrarCriterios)}
          className="text-sm text-verdeOscuro hover:text-verdeClaro transition"
        >
          {mostrarCriterios ? "Ocultar" : "Mostrar"}
        </button>
      </div>

      {mostrarCriterios && (
        <ul className="list-disc pl-6 mt-3 text-justify text-gray-700 space-y-2 text-sm">
          {criterios.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
