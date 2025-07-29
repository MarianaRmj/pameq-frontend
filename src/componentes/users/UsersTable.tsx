"use client";

import { useEffect, useState } from "react";
import { UserResponseDto } from "./types";
import { EditUserModal } from "./EditUserModal";
import { useConfirm } from "@/hooks/useConfirm";

export const UsersTable = () => {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [sedes, setSedes] = useState<{ id: number; nombre_sede: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();
  const [alerta, setAlerta] = useState<null | {
    tipo: "success" | "error";
    mensaje: string;
  }>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [usersRes, sedesRes] = await Promise.all([
        fetch("http://localhost:3001/users"),
        fetch("http://localhost:3001/sedes"),
      ]);

      const usersData = await usersRes.json();
      const sedesData = await sedesRes.json();

      // Agregar sedeNombre al usuario
      const usuariosConSede = usersData.map((user: UserResponseDto) => {
        const sede = sedesData.find(
          (s: { id: number; nombre_sede: string }) => s.id === user.sedeId
        );
        return {
          ...user,
          sedeNombre: sede?.nombre_sede || null,
        };
      });

      setUsers(usuariosConSede);
      setSedes(sedesData);
    };

    fetchData();
  }, []);

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
          null;

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

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-2xl font-bold text-verdeOscuro mb-4">
        Usuarios por Sede
      </h2>
      {alerta && (
        <div
          className={`my-2 px-4 py-2 rounded text-sm font-semibold ${
            alerta.tipo === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {alerta.mensaje}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 text-sm">
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
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-verdeClaro/10">
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
            ))}
          </tbody>
        </table>
      </div>
      <EditUserModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        sedes={sedes}
      />
      <ConfirmModal /> {/* ✅ Renderiza el modal al final */}
    </div>
  );
};
