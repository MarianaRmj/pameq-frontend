type Aspecto = { grupo: string; nombre: string; valor?: number | string };

type Props = {
  aspectos: Aspecto[];
  setAspectos: (aspectos: Aspecto[]) => void;
};

export const AspectosTable = ({ aspectos, setAspectos }: Props) => {
  return (
    <div className="font-nunito mb-6">
      <div className="overflow-x-auto rounded-lg border border-gray-400">
        <table className="w-full text-sm text-left border-collapse">
          <tbody>
            {(() => {
              const grupos = aspectos.reduce<Record<string, Aspecto[]>>(
                (acc, a) => {
                  (acc[a.grupo] ||= []).push(a);
                  return acc;
                },
                {}
              );

              return Object.entries(grupos).map(([grupo, items]) =>
                items.map((a, idx) => (
                  <tr
                    key={`${grupo}-${a.nombre}-${idx}`}
                    className="border-t border-gray-400 hover:bg-gray-50 transition"
                  >
                    {idx === 0 && (
                      <th
                        scope="rowgroup"
                        rowSpan={items.length}
                        className="px-2 border-r border-gray-400 align-top font-semibold text-verdeOscuro bg-gray-50"
                      >
                        {grupo}
                      </th>
                    )}
                    <td className="px-2 border-r border-gray-400 align-top text-gray-700">
                      {a.nombre}
                    </td>
                    <td className="px-2 align-top">
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={a.valor ?? ""}
                        onChange={(e) => {
                          const v = e.currentTarget.valueAsNumber;
                          const nuevos = aspectos.map((item) =>
                            item.grupo === a.grupo && item.nombre === a.nombre
                              ? { ...item, valor: Number.isFinite(v) ? v : "" }
                              : item
                          );
                          setAspectos(nuevos);
                        }}
                        className="border border-gray-400 rounded-lg px-2 py-1 w-20 text-center focus:ring-2 focus:ring-verdeClaro focus:outline-none"
                      />
                    </td>
                  </tr>
                ))
              );
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
};
