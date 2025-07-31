"use client";
import Link from "next/link";
import { useState } from "react";
import {
  FiChevronDown,
  FiUsers,
  FiBarChart2,
  FiInfo,
  FiHome,
  FiEdit,
  FiList,
  FiFilter,
  FiGrid,
  FiCheckCircle,
  FiTrendingUp,
  FiClipboard,
  FiEye,
  FiAward,
  FiBookOpen,
  FiGitBranch,
  FiZap,
  FiBarChart,
  FiLogOut,
} from "react-icons/fi";
import { AiFillCalendar } from "react-icons/ai";
import { BsFillBarChartFill } from "react-icons/bs";
import { FaMapMarkedAlt, FaUniversity } from "react-icons/fa";

export default function Sidebar() {
  const [openPamec, setOpenPamec] = useState(false);
  const [openInforme, setOpenInforme] = useState(false);
  const [openParametrization, setOpenParametrization] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-[#2C5959] text-white p-5 border-r-4 font-nunito shadow-md min-h-screen flex flex-col justify-between">

      {/* Parte superior */}

        {/* Logo y Usuario */}
        <div className="flex flex-col items-center mb-10">
         <div className="flex flex-col items-center mb-6">
          <img
            src="/logo2.png"
            alt="PAMEQ"
            className="w-28 drop-shadow"
            style={{ filter: "grayscale(100%) brightness(3.3)" }}
          />
          <h1 className="mt-3 text-lg font-nunito tracking-wide">IPS Colombia</h1>
          <p className="text-sm font-nunito text-neutral-200">Usuario Admin</p>
        </div>

        {/* Navegación */}
        <nav className="space-y-2">
          <SidebarLink href="/dashboard" icon={<FiHome />}>Inicio</SidebarLink>

            <DropdownSection
            label="Parametrización"
            isOpen={openParametrization}
            toggleOpen={() => setOpenParametrization(!openParametrization)}
            items={[
              { label: "Institución", href: "/dashboard/parameterization", icon: <FaUniversity /> },
              { label: "Sedes", href: "/dashboard/parameterization/sedes", icon: <FaMapMarkedAlt /> },
            ]}
          />
          <SidebarLink href="/dashboard/calendar" icon={<AiFillCalendar />}>Calendario</SidebarLink>
          <SidebarLink href="/dashboard/schedule" icon={<FiBarChart2 />}>Cronograma</SidebarLink>
          <SidebarLink href="/dashboard/activities" icon={<BsFillBarChartFill />}>Actividades Previas</SidebarLink>

          {/* PAMEC */}
          <DropdownSection
            label="PAMEC"
            isOpen={openPamec}
            toggleOpen={() => setOpenPamec(!openPamec)}
            items={[
              { label: "Autoevaluación", href: "/dashboard/pamec/self-assessment", icon: <FiEdit /> },
              { label: "Selección Procesos", href: "/dashboard/pamec/selection", icon: <FiList /> },
              { label: "Criterios Priorización", href: "/dashboard/pamec/criteria", icon: <FiFilter /> },
              { label: "Matriz Priorización", href: "/dashboard/pamec/matrix", icon: <FiGrid /> },
              { label: "Definición Calidad", href: "/dashboard/pamec/definition", icon: <FiCheckCircle /> },
              { label: "Ficha Indicadores", href: "/dashboard/pamec/file", icon: <FiBarChart2 /> },
              { label: "Medición Inicial", href: "/dashboard/pamec/measurement", icon: <FiTrendingUp /> },
              { label: "Plan De Acción", href: "/dashboard/pamec/plan", icon: <FiClipboard /> },
              { label: "Seguimiento", href: "/dashboard/pamec/follow-up", icon: <FiEye /> },
              { label: "Evaluación", href: "/dashboard/pamec/assessment", icon: <FiAward /> },
              { label: "Aprendizaje", href: "/dashboard/pamec/learning", icon: <FiBookOpen /> },
            ]}
          />

          {/* INFORMES */}
          <DropdownSection
            label="Informes"
            isOpen={openInforme}
            toggleOpen={() => setOpenInforme(!openInforme)}
            items={[
              { label: "Procesos", href: "/dashboard/report/processes", icon: <FiGitBranch /> },
              { label: "Grupo Estándar", href: "/dashboard/report/cluster", icon: <FiUsers /> },
              { label: "Oportunidad Mejora", href: "/dashboard/report/chance", icon: <FiZap /> },
              { label: "Nivel De Ejecución", href: "/dashboard/report/level", icon: <FiBarChart /> },
            ]}
          />

          <SidebarLink href="/dashboard/users" icon={<FiUsers />}>Usuarios</SidebarLink>
          <SidebarLink href="/dashboard/about" icon={<FiInfo />}>Acerca de</SidebarLink>
        </nav>
      </div>

      {/* Botón de salida */}
      <div className="mt-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-verdeClaro/90 transition-colors duration-200 text-sm font-nunito text-white"
        >
          <FiLogOut className="text-lg" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-verdeClaro/90 transition-colors duration-200 text-sm font-medium text-white"
    >
      <span className="text-lg">{icon}</span>
      <span>{children}</span>
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
  items: { label: string; href: string; icon: React.ReactNode }[];
}) {
  return (
    <div>
      <button
        onClick={toggleOpen}
        className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-verdeClaro/90 transition-colors duration-200 text-sm font-medium text-white"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <FiChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
          {label}
        </span>
      </button>
      {isOpen && (
        <div className="ml-6 mt-2 space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm text-white hover:bg-verdeClaro/70 transition"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
