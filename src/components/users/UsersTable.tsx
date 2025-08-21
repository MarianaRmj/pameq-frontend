"use client";

import { useEffect, useState } from "react";
import { CreateUserDto, UserResponseDto } from "./types";
import { EditUserModal } from "./EditUserModal";
import { useConfirm } from "@/hooks/useConfirm";
import { CreateUserModal } from "./CreateUserModal";
import { useCallback } from "react";

const rolesDisponibles = [
  "admin",
  "coordinador",
  "evaluador",
  "usuario",
  "editor",
] as const;

export const UsersTable = () => {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sedes, setSedes] = useState<{ id: number; nombre_sede: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [alerta, setAlerta] = useState<null | {
    tipo: "success" | "error";
    mensaje: string;
  }>(null);
  const { confirm, ConfirmModal } = useConfirm();

  const limit = 10;
  const institutionId = 1; // ✅ Ajusta esto según usuario autenticado

  // Carga inicial de sedes y usuarios
  useEffect(() => {
    fetchUsers(currentPage);

    const fetchSedes = async () => {
      try {
        const res = await fetch("http://localhost:3001/sedes");
        const data = await res.json();
        setSedes(data);
      } catch (error) {
        console.error("Error al obtener sedes:", error);
      }
    };

    fetchSedes();
  }, []);

  const fetchUsers = useCallback(
    async (page: number) => {
      try {
        const response = await fetch(
          `http://localhost:3001/users?page=${page}&limit=${limit}`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-institution-id": institutionId.toString(),
            },
          }
        );

        const data = await response.json();

        if (response.ok && Array.isArray(data.users)) {
          const usuariosConSede = data.users.map((user: UserResponseDto) => {
            const sede = sedes.find((s) => s.id === user.sedeId);
            return { ...user, sedeNombre: sede?.nombre_sede || "-" };
          });

          setUsers(usuariosConSede);
          setTotalPages(data.totalPages);
          setCurrentPage(data.currentPage);
        }
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    },
    [sedes, limit, institutionId]
  );

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, fetchUsers]);

  const handleEditClick = (user: UserResponseDto) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (updated: Partial<UserResponseDto>) => {
    if (!selectedUser) return;

    confirm("¿Deseas guardar los cambios de este usuario?", async () => {
      const response = await fetch(
        `http://localhost:3001/users/${selectedUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-institution-id": institutionId.toString(), // Opcional si lo pide
          },
          body: JSON.stringify(updated),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        const sedeNombre =
          updatedUser.sede?.nombre_sede ||
          sedes.find(
            (s) => s.id === updatedUser.sedeId || s.id === updatedUser.sede?.id
          )?.nombre_sede ||
          "-";

        setUsers((prev) =>
          prev.map((u) =>
            u.id === updatedUser.id ? { ...updatedUser, sedeNombre } : u
          )
        );

        handleCloseModal();
        setAlerta({
          tipo: "success",
          mensaje: "✅ Usuario actualizado correctamente.",
        });
        setTimeout(() => setAlerta(null), 4000);
      } else {
        setAlerta({ tipo: "error", mensaje: "❌ Error al actualizar usuario" });
      }
    });
  };

  const handleCreateUser = async (nuevo: CreateUserDto) => {
    try {
      const res = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-institution-id": institutionId.toString(),
        },
        body: JSON.stringify(nuevo),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error creando usuario");
      }

      const nuevoUsuario = await res.json();
      const sedeNombre =
        nuevoUsuario.sede?.nombre_sede ||
        sedes.find((sede) => sede.id === nuevoUsuario.sedeId)?.nombre_sede ||
        "-";

      setUsers((prev) => [...prev, { ...nuevoUsuario, sedeNombre }]);
      setIsCreateOpen(false);
      setAlerta({
        tipo: "success",
        mensaje: "✅ Usuario creado correctamente.",
      });
      setTimeout(() => setAlerta(null), 4000);
    } catch (error) {
      console.error("Error creando usuario:", error);
      setAlerta({
        tipo: "error",
        mensaje: `❌ Error creando usuario: ${error}`,
      });
    }
  };

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-2xl font-nunito text-verdeOscuro mb-4">
        Usuarios por Sede
      </h2>

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
          className="bg-verdeOscuro font-nunito text-white px-2 py-1 rounded hover:bg-verdeClaro transition"
        >
          ➕ Nuevo Usuario
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 text-sm font-nunito">
          <thead className="bg-verdeOscuro text-white">
            <tr>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Rol</th>
              <th className="p-2 text-left">Sede</th>
              <th className="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(users) && users.length > 0 ? (
              users
                .filter((user) => typeof user === "object" && user.id)
                .map((user, index) => {
                  const key = user.id ?? `fallback-${index}`;
                  return (
                    <tr
                      key={key}
                      className="border-t hover:bg-verdeClaro/10 font-nunito"
                    >
                      <td className="p-2">{user.nombre}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2 capitalize">{user.rol}</td>
                      <td className="p-2">{user.sedeNombre || "-"}</td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          ✏️
                        </button>
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No hay usuarios disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditUserModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        sedes={sedes}
        roles={[...rolesDisponibles]}
      />

      <ConfirmModal />

      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateUser}
        sedes={sedes}
        roles={[...rolesDisponibles]}
      />

      <div className="flex justify-center items-center gap-1 mt-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="px-2 rounded border bg-gray-100 hover:bg-gray-100 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          className="px-3 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
