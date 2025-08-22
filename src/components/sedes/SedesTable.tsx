"use client";

import { useEffect, useState } from "react";
import { useConfirm } from "@/hooks/useConfirm";
import { EditSedeModal } from "./EditSedeModal ";
import { CreateSedeModal } from "./CreateSedeModal";

// Tipos básicos para sede
export interface SedeDto {
  id: number;
  nombre_sede: string;
  direccion: string;
  telefono: string;
  nombre_lider: string;
  codigo_habilitacion: string;
}

export const SedesTable = () => {
  const [sedes, setSedes] = useState<SedeDto[]>([]);
  const [selectedSede, setSelectedSede] = useState<SedeDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();
  const [alerta, setAlerta] = useState<null | {
    tipo: "success" | "error";
    mensaje: string;
  }>(null);

  // Traer sedes
  const fetchSedes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sedes`);
      const data = await res.json();
      setSedes(data);
    } catch {
      setAlerta({
        tipo: "error",
        mensaje: "❌ Error al obtener sedes",
      });
    }
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  // Editar
  const handleEditClick = (sede: SedeDto) => {
    setSelectedSede(sede);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSede(null);
  };

  const handleSaveSede = async (updated: Partial<SedeDto>) => {
    if (!selectedSede) return;
    confirm("¿Deseas guardar los cambios de esta sede?", async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sedes/${selectedSede.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }
      );
      if (response.ok) {
        await fetchSedes();
        handleCloseModal();
        setAlerta({
          tipo: "success",
          mensaje: "✅ Sede actualizada correctamente.",
        });
        setTimeout(() => setAlerta(null), 4000);
      } else {
        setAlerta({
          tipo: "error",
          mensaje: "❌ Error al actualizar sede",
        });
      }
    });
  };

  // Crear sede
  const handleCreateSede = async (nuevo: Partial<SedeDto>) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sedes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo),
      });
      if (res.ok) {
        await fetchSedes();
        setIsCreateOpen(false);
        setAlerta({
          tipo: "success",
          mensaje: "✅ Sede creada correctamente.",
        });
        setTimeout(() => setAlerta(null), 4000);
      } else {
        setAlerta({
          tipo: "error",
          mensaje: "❌ Error creando sede",
        });
      }
    } catch {
      setAlerta({
        tipo: "error",
        mensaje: "❌ Error creando sede",
      });
    }
  };

  // Eliminar sede
  const handleDelete = async (sede: SedeDto) => {
    confirm(
      `¿Deseas eliminar la sede "${sede.nombre_sede}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/sedes/${sede.id}`,
            { method: "DELETE" }
          );
          if (res.ok) {
            await fetchSedes();
            setAlerta({
              tipo: "success",
              mensaje: "✅ Sede eliminada correctamente.",
            });
          } else {
            // Intenta extraer el mensaje de error del backend
            const errorData = await res.json();
            setAlerta({
              tipo: "error",
              mensaje:
                errorData.message ||
                "❌ No se pudo eliminar la sede. Verifica si tiene ciclos asociados.",
            });
          }
          setTimeout(() => setAlerta(null), 4000);
        } catch {
          setAlerta({
            tipo: "error",
            mensaje: "❌ Error al eliminar sede.",
          });
          setTimeout(() => setAlerta(null), 4000);
        }
      }
    );
  };

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-2xl font-nunito text-verdeOscuro mb-4">Sedes</h2>
      {alerta && (
        <div
          className={`my-2 px-4 py-2 rounded text-sm font-nunito ${
            alerta.tipo === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {alerta.mensaje}
        </div>
      )}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-verdeOscuro text-white font-nunito px-2 py-1 rounded hover:bg-verdeClaro transition"
        >
           + Nueva Sede
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 text-sm">
          <thead className="bg-verdeOscuro font-nunito text-white">
            <tr>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Dirección</th>
              <th className="p-2 text-left">Teléfono</th>
              <th className="p-2 text-left">Líder</th>
              <th className="p-2 text-left">Código</th>
              <th className="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sedes.length > 0 ? (
              sedes.map((sede) => (
                <tr key={sede.id} className="border-t hover:bg-verdeClaro/10">
                  <td className="p-2">{sede.nombre_sede}</td>
                  <td className="p-2">{sede.direccion}</td>
                  <td className="p-2">{sede.telefono}</td>
                  <td className="p-2">{sede.nombre_lider}</td>
                  <td className="p-2">{sede.codigo_habilitacion}</td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleEditClick(sede)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(sede)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No hay sedes registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Modales */}
      <EditSedeModal
        sede={selectedSede}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSede}
      />
      <ConfirmModal />
      <CreateSedeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateSede}
      />
    </div>
  );
};
