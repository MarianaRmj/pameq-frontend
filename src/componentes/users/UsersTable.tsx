"use client";

import { useEffect, useState } from "react";
import { CreateUserDto, UserResponseDto } from "./types";
import { EditUserModal } from "./EditUserModal";
import { useConfirm } from "@/hooks/useConfirm";
import { CreateUserModal } from "./CreateUserModal";

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
  const limit = 10; // Número de usuarios por página
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();
  const [alerta, setAlerta] = useState<null | {
    tipo: "success" | "error";
    mensaje: string;
  }>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetching users and sedes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, sedesRes] = await Promise.all([
          fetch("http://localhost:3001/users"),
          fetch("http://localhost:3001/sedes"),
        ]);

        const usersData = await usersRes.json();
        const sedesData = await sedesRes.json();

        // Comprobamos la estructura de los datos
        console.log("Usuarios:", usersData);
        console.log("Sedes:", sedesData);

        if (Array.isArray(usersData)) {
          const usuariosConSede = usersData.map((user: UserResponseDto) => {
            const sede = sedesData.find(
              (s: { id: number; nombre_sede: string }) => s.id === user.sedeId
            );
            return {
              ...user,
              sedeNombre: sede?.nombre_sede || "-",
            };
          });
          setUsers(usuariosConSede);
        }

        setSedes(sedesData);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, []);

  const fetchUsers = async (page: number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/users?page=${String(page)}&limit=${String(
          limit
        )}`
      );
      const data = await response.json();
      console.log("Usuarios paginados:", data);

      if (response.ok && Array.isArray(data.users)) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } else {
        console.error("Error en la API de usuarios:", response.status);
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleEditClick = (user: UserResponseDto) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Save updated user data
  const handleSaveUser = async (updated: Partial<UserResponseDto>) => {
    if (!selectedUser) return;

    confirm("¿Deseas guardar los cambios de este usuario?", async () => {
      const response = await fetch(
        `http://localhost:3001/users/${selectedUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updated),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        const sedeNombreActualizada =
          updatedUser.sedeNombre ||
          updatedUser.sede?.nombre_sede ||
          sedes.find(
            (s) => s.id === updatedUser.sedeId || s.id === updatedUser.sede?.id
          )?.nombre_sede ||
          "-";

        setUsers((prev) =>
          prev.map((u) =>
            u.id === updatedUser.id
              ? {
                  ...updatedUser,
                  sedeNombre: sedeNombreActualizada,
                }
              : u
          )
        );

        handleCloseModal();
        setAlerta({
          tipo: "success",
          mensaje: "✅ Usuario actualizado correctamente.",
        });
        setTimeout(() => setAlerta(null), 4000);
      } else {
        setAlerta({
          tipo: "error",
          mensaje: "❌ Error al actualizar usuario",
        });
      }
    });
  };

  const handleCreateUser = async (nuevo: CreateUserDto) => {
    try {
      const res = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo),
      });

      const nuevoUsuario = await res.json();

      // Asegúrate de que la sedeNombre se obtenga correctamente
      const sedeNombre =
        nuevoUsuario.sede?.nombre_sede || // Si la sede está en los datos del nuevo usuario
        sedes.find((sede) => sede.id === nuevoUsuario.sedeId)?.nombre_sede || // Si la sede está en la lista de sedes cargadas
        "-"; // Si no hay sede, mostrar un guión

      // Actualiza el estado de los usuarios
      setUsers((prev) => [
        ...prev,
        {
          ...nuevoUsuario,
          sedeNombre, // Asegura que la sede se incluya en el nuevo usuario
        },
      ]);

      // Cierra el modal
      setIsCreateOpen(false);

      // Mostrar alerta de éxito
      setAlerta({
        tipo: "success",
        mensaje: "✅ Usuario creado correctamente.",
      });
      setTimeout(() => setAlerta(null), 4000);
    } catch (error) {
      console.error("Error creando usuario:", error);
      // Mostrar alerta de error
      setAlerta({
        tipo: "error",
        mensaje: "❌ Error creando usuario",
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
              users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-verdeClaro/10 font-nunito">
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
              ))
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
      <div>
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
    </div>
  );
};
