"use client";

import { useEditarInstitucion } from "./useEditarInstitucion";
import { InstitucionFormFields } from "./InstitucionFormFields";
import { CiclosTable } from "./CiclosTable";

export default function EditarInstitucion() {
 const {
  formData,
  handleChange,
  sedes,
  updateCiclo,
  saveCiclo,
  eliminarCiclo,
  addCiclo,
  handleSubmitInstitucion,
  guardando,
  loading,
  alerta,
  setAlerta,
  ConfirmModal,
  isFormChanged,
  ciclosPaginados, // <-- agrega esto
  currentPage,     // <-- y esto
  totalPages,      // <-- y esto
  setCurrentPage,  // <-- y esto
} = useEditarInstitucion();


  if (loading) return <p className="p-8">Cargando datos...</p>;

  return (
    <section className="max-w-6xl mx-auto mt-6 px-6 py-6 bg-white rounded-3xl shadow-lg font-nunito text-negro">
      <h2 className="text-3xl font-nunito text-verdeOscuro mb-8 tracking-wide">
        Parametrización de Institución
      </h2>
      <form
        onSubmit={handleSubmitInstitucion}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <InstitucionFormFields
          formData={formData}
          handleChange={handleChange}
        />
        <ConfirmModal />
        <CiclosTable
          ciclosPaginados={ciclosPaginados}
          sedes={sedes}
          updateCiclo={updateCiclo}
          saveCiclo={saveCiclo}
          eliminarCiclo={eliminarCiclo}
          addCiclo={addCiclo}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />

        <div className="md:col-span-2 flex justify-end mt-2">
          <button
            type="submit"
            disabled={guardando || !isFormChanged()}
            className={`bg-verdeOscuro text-white px-4 py-1 rounded transition ${
              guardando || !isFormChanged()
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-verdeClaro"
            }`}
          >
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>

      {alerta && (
        <div className="fixed top-5 right-5 z-50 animate-fade-in-up">
          <div
            className={`px-6 py-4 rounded-xl shadow-lg border w-[320px] flex items-start gap-3 ${
              alerta.tipo === "success"
                ? "bg-green-100 text-green-800 border-green-300"
                : "bg-red-100 text-red-800 border-red-300"
            }`}
          >
            <div className="text-2xl">
              {alerta.tipo === "success" ? "✅" : "❌"}
            </div>
            <div className="flex-1 text-sm">{alerta.mensaje}</div>
            <button
              onClick={() => setAlerta(null)}
              className="text-xl font-nunito text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
