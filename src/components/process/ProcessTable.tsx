"use client";

import { useEffect, useState } from "react";
import { useConfirm } from "@/hooks/useConfirm";
import { EditProcessModal } from "./EditProcessModal";
import { CreateProcessModal } from "./CreateProcessModal";
import { ProcessForm } from "./CreateProcessModal";

export interface ProcessDto {
  id: number;
  nombre_proceso: string;
  descripcion: string;
  lider: string;
  numero_integrantes: string;
  indicadores: { id: number; nombre: string }[];
}

export const ProcessTable = () => {
  const [processes, setProcesses] = useState<ProcessDto[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<ProcessDto | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();
  const [alerta, setAlerta] = useState<null | {
    tipo: "success" | "error";
    mensaje: string;
  }>(null);

  const fetchProcesses = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/processes`);
      const data = await res.json();
      setProcesses(data);
    } catch {
      setAlerta({
        tipo: "error",
        mensaje: "❌ Error al obtener procesos",
      });
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  const handleEditClick = (process: ProcessDto) => {
    setSelectedProcess(process);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProcess(null);
  };

  const handleSaveProcess = async (updated: Partial<ProcessDto>) => {
    if (!selectedProcess) return;
    confirm("¿Deseas guardar los cambios de este proceso?", async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/processes/${selectedProcess.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }
      );
      if (response.ok) {
        await fetchProcesses();
        handleCloseModal();
        setAlerta({
          tipo: "success",
          mensaje: "✅ Proceso actualizado correctamente.",
        });
      } else {
        setAlerta({
          tipo: "error",
          mensaje: "❌ Error al actualizar proceso",
        });
      }
      setTimeout(() => setAlerta(null), 4000);
    });
  };

  const handleCreateProcess = async (procesos: ProcessForm) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/processes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(procesos),
      });
      if (res.ok) {
        await fetchProcesses();
        setIsCreateOpen(false);
        setAlerta({
          tipo: "success",
          mensaje: "✅ Proceso creado correctamente.",
        });
      } else {
        setAlerta({
          tipo: "error",
          mensaje: "❌ Error creando proceso",
        });
      }
    } catch {
      setAlerta({
        tipo: "error",
        mensaje: "❌ Error creando proceso",
      });
    }
    setTimeout(() => setAlerta(null), 4000);
  };

  const handleDelete = async (proceso: ProcessDto) => {
    confirm(
      `¿Deseas eliminar el proceso "${proceso.nombre_proceso}"? Esta acción no se puede deshacer.`,
      async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/processes/${proceso.id}`,
            { method: "DELETE" }
          );
          if (res.ok) {
            await fetchProcesses();
            setAlerta({
              tipo: "success",
              mensaje: "✅ Proceso eliminado correctamente.",
            });
          } else {
            const errorData = await res.json();
            setAlerta({
              tipo: "error",
              mensaje:
                errorData.message ||
                "❌ No se pudo eliminar el proceso. Verifica si tiene ciclos asociados.",
            });
          }
        } catch {
          setAlerta({
            tipo: "error",
            mensaje: "❌ Error al eliminar proceso.",
          });
        }
        setTimeout(() => setAlerta(null), 4000);
      }
    );
  };

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-2xl font-nunito text-verdeOscuro mb-4">Procesos</h2>

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
          ➕ Nuevo Proceso
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 text-sm">
          <thead className="bg-verdeOscuro font-nunito text-white">
            <tr>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Descripción</th>
              <th className="p-2 text-left">Líder</th>
              <th className="p-2 text-left"># Integrantes</th>
              <th className="p-2 text-left">Indicadores</th>
              <th className="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {processes.length > 0 ? (
              processes.map((proceso) => (
                <tr
                  key={proceso.id}
                  className="border-t hover:bg-verdeClaro/10"
                >
                  <td className="p-2">{proceso.nombre_proceso}</td>
                  <td className="p-2">{proceso.descripcion}</td>
                  <td className="p-2">{proceso.lider}</td>
                  <td className="p-2">{proceso.numero_integrantes}</td>
                  <td className="p-2">
                    {proceso.indicadores.map((i) => i.nombre).join(", ")}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleEditClick(proceso)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(proceso)}
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
                  No hay procesos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      <EditProcessModal
        process={selectedProcess}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProcess}
      />
      <ConfirmModal />
      <CreateProcessModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateProcess}
      />
    </div>
  );
};
