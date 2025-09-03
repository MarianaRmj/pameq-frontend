"use client";

export default function OportunidadesTextarea({
  oportunidades,
  setOportunidades,
}: {
  oportunidades: string[];
  setOportunidades: (v: string[]) => void;
}) {
  return (
    <div className="mb-4">
      <label className="block text-gray-800 font-normal text-md mb-3">
        Oportunidades de Mejora
      </label>
      {oportunidades.map((o, i) => (
        <textarea
          key={i}
          value={o}
          onChange={(e) => {
            const nuevas = [...oportunidades];
            nuevas[i] = e.target.value;
            setOportunidades(nuevas);
          }}
          placeholder="Escribe una oportunidad de mejora..."
          className="block border border-gray-300 rounded-lg px-4 py-2 w-full mb-3 text-sm focus:ring-2 focus:ring-verdeClaro focus:outline-none"
        />
      ))}
      <button
        type="button"
        onClick={() => setOportunidades([...oportunidades, ""])}
        className="text-verdeOscuro text-sm font-semibold hover:text-verdeClaro transition"
      >
        + Agregar otra oportunidad
      </button>
    </div>
  );
}
