"use client";

export default function CalificacionGeneralInput({
  promedio,
}: {
  promedio: string;
}) {
  return (
    <div className="mb-4">
      <label className="block text-gray-800 font-medium text-sm mb-2">
        Calificación General
      </label>
      <input
        type="text"
        readOnly
        value={promedio}
        className="border border-gray-300 rounded-lg px-4 py-2 w-28 text-center bg-gray-100 text-gray-700"
      />
    </div>
  );
}
