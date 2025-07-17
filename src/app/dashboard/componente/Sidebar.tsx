"use client";
import Link from "next/link";
import { useState } from "react";
import {
  FiChevronDown,
  FiSettings,
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
} from "react-icons/fi";
import { AiFillCalendar } from "react-icons/ai";
import { BsFillBarChartFill } from "react-icons/bs";

export default function Sidebar() {
  const [openPamec, setOpenPamec] = useState(false);
  const [openInforme, setOpenInforme] = useState(false);

  return (
    <aside className="w-64 bg-verdeSuave text-white bg-[#2C5959] p-5 border-r-4 border-verdeClaro font-nunito shadow-md min-h-screen">
      {/* Logo y Usuario */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md">
          <span className="text-sm text-neutral-800">Sin imagen</span>
        </div>
        <h1 className="mt-3 text-lg font-bold tracking-wide">IPS Colombia</h1>
        <p className="text-sm text-neutral-200">Usuario Admin</p>
      </div>

      {/* Navegación */}
      <nav className="space-y-2">
        <SidebarLink href="/dashboard" icon={<FiHome />}>Inicio</SidebarLink>
        <SidebarLink href="/dashboard/parameterization" icon={<FiSettings />}>Parametrización</SidebarLink>
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
    </aside>
  );
}

function SidebarLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-verdeClaro transition text-sm font-medium"
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
        className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-verdeClaro transition text-sm font-medium"
        aria-expanded={isOpen}
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
              className="flex items-center gap-2 px-2 py-1 hover:underline hover:text-white transition"
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
