"use client";

export default function FortalezasTextarea({
  fortalezas,
  setFortalezas,
}: {
  fortalezas: string[];
  setFortalezas: (v: string[]) => void;
}) {
  return (
    <div className="mb-4">
      <label className="block text-gray-800 font-normal text-md mb-3">
        Fortalezas
      </label>
      {fortalezas.map((f, i) => (
        <textarea
          key={i}
          value={f}
          onChange={(e) => {
            const nuevas = [...fortalezas];
            nuevas[i] = e.target.value;
            setFortalezas(nuevas);
          }}
          placeholder="Escribe una fortaleza..."
          className="block border border-gray-300 rounded-lg px-4 py-2 w-full mb-3 text-sm focus:ring-2 focus:ring-verdeClaro focus:outline-none"
        />
      ))}
      <button
        type="button"
        onClick={() => setFortalezas([...fortalezas, ""])}
        className="text-verdeOscuro text-sm font-semibold hover:text-verdeClaro transition"
      >
        + Agregar
      </button>
    </div>
  );
}
