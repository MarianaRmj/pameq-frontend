"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyboardEvent, useState } from "react";
import {
  FiChevronDown,
  FiUsers,
  FiBarChart2,
  FiInfo,
  FiHome,
  FiList,
  FiGrid,
  FiCheckCircle,
  FiTrendingUp,
  FiClipboard,
  FiAward,
  FiBookOpen,
  FiLogOut,
  FiActivity,
  FiCalendar,
  FiClock,
  FiCheckSquare,
  FiMapPin,
  FiMenu,
  FiX,
} from "react-icons/fi";

export default function Sidebar() {
  const [openPamec, setOpenPamec] = useState(false);
  const [openInforme, setOpenInforme] = useState(false);
  const [openParametrization, setOpenParametrization] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside
      className={[
        "bg-[#2C5959] text-white p-4 border-r-4 font-nunito shadow-md min-h-screen flex flex-col justify-between transition-all duration-300",
        collapsed ? "w-20" : "w-64",
      ].join(" ")}
    >
      {/* Top */}
      <div>
        {/* Header + Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo2.png"
              alt="PAMEQ"
              className={[
                "drop-shadow transition-all",
                collapsed ? "w-8" : "w-16",
              ].join(" ")}
              style={{ filter: "grayscale(100%) brightness(3.3)" }}
            />
            {!collapsed && (
              <div className="leading-tight">
                <h1 className="text-base font-nunito tracking-wide">PAMEQ</h1>
                <p className="text-xs text-neutral-300">IPS Colombia</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? <FiMenu /> : <FiX />}
          </button>
        </div>

        {/* Navegación */}
        <nav className="space-y-2">
          <SidebarLink
            href="/dashboard"
            icon={<FiHome />}
            collapsed={collapsed}
            label="Inicio"
          />

          <DropdownSection
            label="Parametrización"
            isOpen={openParametrization}
            toggleOpen={() => setOpenParametrization(!openParametrization)}
            items={[
              {
                label: "Institución",
                href: "/dashboard/parameterization",
                icon: <FiHome />,
              },
              {
                label: "Sedes",
                href: "/dashboard/parameterization/sedes",
                icon: <FiMapPin />,
              },
              {
                label: "Procesos",
                href: "/dashboard/parameterization/procesos",
                icon: <FiUsers />,
              },
            ]}
            collapsed={collapsed}
          />

          <SidebarLink
            href="/dashboard/calendar"
            icon={<FiCalendar />}
            collapsed={collapsed}
            label="Calendario"
          />
          <SidebarLink
            href="/dashboard/schedule"
            icon={<FiClock />}
            collapsed={collapsed}
            label="Cronograma"
          />
          <SidebarLink
            href="/dashboard/activities"
            icon={<FiCheckSquare />}
            collapsed={collapsed}
            label="Actividades Previas"
          />

          <DropdownSection
            label="PAMEC"
            isOpen={openPamec}
            toggleOpen={() => setOpenPamec(!openPamec)}
            items={[
              {
                label: "Autoevaluación",
                href: "/dashboard/pamec/self-assessment",
                icon: <FiCheckCircle />,
              },
              {
                label: "Selección Procesos",
                href: "/dashboard/pamec/selection",
                icon: <FiList />,
              },
              {
                label: "Matriz Priorización",
                href: "/dashboard/pamec/matriz",
                icon: <FiGrid />,
              },
              {
                label: "Definición Calidad",
                href: "/dashboard/pamec/definition",
                icon: <FiCheckCircle />,
              },
              {
                label: "Ficha Indicadores",
                href: "/dashboard/pamec/file",
                icon: <FiBarChart2 />,
              },
              {
                label: "Medición Inicial",
                href: "/dashboard/pamec/measurement",
                icon: <FiActivity />,
              },
              {
                label: "Plan De Acción",
                href: "/dashboard/pamec/plan",
                icon: <FiClipboard />,
              },
              {
                label: "Seguimiento",
                href: "/dashboard/pamec/follow-up",
                icon: <FiTrendingUp />,
              },
              {
                label: "Evaluación",
                href: "/dashboard/pamec/assessment",
                icon: <FiAward />,
              },
              {
                label: "Aprendizaje",
                href: "/dashboard/pamec/learning",
                icon: <FiBookOpen />,
              },
            ]}
            collapsed={collapsed}
          />

          <DropdownSection
            label="Informes"
            isOpen={openInforme}
            toggleOpen={() => setOpenInforme(!openInforme)}
            items={[
              {
                label: "Analisis",
                href: "/dashboard/reports/self-assessment",
                icon: <FiCheckCircle />,
              },
            ]}
            collapsed={collapsed}
          />

          <SidebarLink
            href="/dashboard/users"
            icon={<FiUsers />}
            collapsed={collapsed}
            label="Usuarios"
          />
          <SidebarLink
            href="/dashboard/about"
            icon={<FiInfo />}
            collapsed={collapsed}
            label="Acerca de"
          />
        </nav>
      </div>

      {/* Logout */}
      <div className="mt-6">
        <button
          onClick={handleLogout}
          className={[
            "flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors duration-200 text-sm",
            collapsed
              ? "justify-center hover:bg-white/10"
              : "hover:bg-white/10",
          ].join(" ")}
          title="Cerrar sesión"
        >
          <FiLogOut className="text-lg" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}

/* ---------- Subcomponentes ---------- */

function SidebarLink({
  href,
  icon,
  label,
  collapsed,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 text-sm",
        active
          ? "bg-white text-[#2C5959] font-nunito"
          : "text-white hover:bg-white/10",
        collapsed ? "justify-center" : "",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
    >
      <span className="text-lg">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

function DropdownSection({
  label,
  isOpen,
  toggleOpen,
  items,
  collapsed,
}: {
  label: string;
  isOpen: boolean;
  toggleOpen: () => void;
  items: { label: string; href: string; icon: React.ReactNode }[];
  collapsed: boolean;
}) {
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleOpen();
    }
  };

  return (
    <div>
      <button
        onClick={toggleOpen}
        onKeyDown={onKeyDown}
        className={[
          "flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors duration-200 text-sm hover:bg-white/10",
          collapsed ? "justify-center" : "",
        ].join(" ")}
        aria-expanded={isOpen}
        aria-controls={`section-${label}`}
        title={
          collapsed ? `${label} (expande el menú para ver opciones)` : undefined
        }
      >
        <span className="flex items-center gap-2">
          <FiChevronDown
            className={`transition-transform ${
              isOpen && !collapsed ? "rotate-180" : ""
            }`}
          />
          {!collapsed && <span>{label}</span>}
        </span>
      </button>

      {/* Cuando está colapsado, no se listan los hijos para mantener el UI limpio */}
      {!collapsed && isOpen && (
        <div id={`section-${label}`} className="ml-6 mt-2 space-y-1">
          {items.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              collapsed={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
