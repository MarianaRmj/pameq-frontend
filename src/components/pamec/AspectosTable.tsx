"use client";

export const AspectosTable = ({
  aspectos,
  setAspectos,
}: {
  aspectos: { grupo: string; nombre: string; valor?: number | string }[];
  setAspectos: (a: { grupo: string; nombre: string; valor?: number | string }[]) => void;
}) => {
  const categorias = {
    ENFOQUE: [
      "SISTEMATICIDAD Y AMPLITUD",
      "PROACTIVIDAD",
      "CICLOS DE EVALUACIÓN Y MEJORAMIENTO",
    ],
    IMPLEMENTACIÓN: [
      "DESPLIEGUE A LA INSTITUCIÓN",
      "DESPLIEGUE AL CLIENTE INTERNO Y/O EXTERNO",
    ],
    RESULTADO: [
      "PERTINENCIA",
      "CONSISTENCIA",
      "AVANCE A LA MEDICIÓN",
      "TENDENCIA",
      "COMPARACIÓN",
    ],
  };

  const handleChange = (nombre: string, value: string) => {
    const nuevos = aspectos.map((a) =>
      a.nombre === nombre ? { ...a, valor: value } : a
    );
    setAspectos(nuevos);
  };

  return (
    <div className="mt-8 font-nunito max-w-4xl mx-auto ">
      <table className="w-full table-auto border border-gray-600 shadow-sm rounded-lg overflow-hidden text-sm">
        <thead className="bg-[#f9fafb] text-gray-700 uppercase tracking-wide">
          <tr>
            <th className="border border-gray-300 px-3 py-1 text-center w-[35%]">
              Categoría
            </th>
            <th className="border border-gray-300 px-3 py-1 text-center w-[50%]">
              Aspecto
            </th>
            <th className="border border-gray-300 px-3 py-1 text-center w-[15%]">
              Valor
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(categorias).map(([categoria, items]) =>
            items.map((nombre, idx) => {
              const aspecto = aspectos.find((a) => a.nombre === nombre);
              return (
                <tr
                  key={nombre}
                  className="hover:bg-[#f6f6f6] transition-colors duration-200"
                >
                  {idx === 0 ? (
                    <td
                      rowSpan={items.length}
                      className="border border-gray-300 px-3 py-1 font-semibold text-verdeOscuro bg-[#f2f2f2] align-top text-sm"
                    >
                      {categoria}
                    </td>
                  ) : null}
                  <td className="border border-gray-300 px-3 py-1 text-gray-800">
                    {nombre}
                  </td>
                  <td className="border border-gray-300 px-3 py-1 text-center">
                    <input
                      type="number"
                      value={aspecto?.valor ?? ""}
                      onChange={(e) => handleChange(nombre, e.target.value)}
                      min={0}
                      max={5}
                      className="w-14 border border-gray-300 rounded-md text-center px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-verdeClaro text-sm"
                      placeholder="0"
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
