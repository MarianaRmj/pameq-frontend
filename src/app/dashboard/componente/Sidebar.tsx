"use client";
import Link from "next/link";
import { useState } from "react";
import {
  FiChevronDown,
  FiSettings,
  FiCalendar,
  FiUsers,
  FiBarChart2,
  FiInfo,
  FiHome,
} from "react-icons/fi";

export default function Sidebar() {
  const [openPamec, setOpenPamec] = useState(false);
  const [openActividades, setOpenActividades] = useState(false);

  return (
    <aside className="w-64 bg-verdeSuave text-white p-5 border-r-4 border-verdeClaro font-nunito shadow-md">
      {/* Logo y Usuario */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md">
          <span className="text-sm text-neutral-500">Sin imagen</span>
        </div>
        <h1 className="mt-3 text-lg font-bold text-white tracking-wide">PAMEQ</h1>
        <p className="text-sm text-neutral-200">Usuario Admin</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-2">
        <SidebarLink href="/dashboard" icon={<FiHome />}>Inicio</SidebarLink>
        <SidebarLink href="/dashboard/configuracion" icon={<FiSettings />}>Configuración</SidebarLink>
        <SidebarLink href="/dashboard/calendario" icon={<FiCalendar />}>Calendario</SidebarLink>
        <SidebarLink href="/dashboard/cronograma" icon={<FiBarChart2 />}>Cronograma</SidebarLink>

        {/* Actividades Previas */}
        <DropdownSection
          label="Actividades Previas"
          isOpen={openActividades}
          toggleOpen={() => setOpenActividades(!openActividades)}
          items={[
            { label: "Diagnóstico", href: "/dashboard/actividades/diagnostico" },
            { label: "Plan", href: "/dashboard/actividades/plan" },
          ]}
        />

        {/* PAMEC */}
        <DropdownSection
          label="PAMEC"
          isOpen={openPamec}
          toggleOpen={() => setOpenPamec(!openPamec)}
          items={[
            { label: "Acciones", href: "/dashboard/pamec/acciones" },
            { label: "Seguimiento", href: "/dashboard/pamec/seguimiento" },
          ]}
        />

        <SidebarLink href="/dashboard/usuarios" icon={<FiUsers />}>Usuarios</SidebarLink>
        <SidebarLink href="/dashboard/informes" icon={<FiBarChart2 />}>Informes</SidebarLink>
        <SidebarLink href="/dashboard/acerca" icon={<FiInfo />}>Acerca de</SidebarLink>
      </nav>
    </aside>
  );
}

function SidebarLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-verdeClaro transition text-sm font-medium"
    >
      {icon}
      {children}
    </Link>
  );
}

function DropdownSection({
  label,
  isOpen,
  toggleOpen,
  items,
}: {
  label: string;
  isOpen: boolean;
  toggleOpen: () => void;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <button
        onClick={toggleOpen}
        className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-verdeClaro transition text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          <FiChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
          {label}
        </span>
      </button>
      {isOpen && (
        <div className="ml-6 mt-2 space-y-1 text-sm text-neutral-100">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-2 py-1 hover:underline hover:text-white transition"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
