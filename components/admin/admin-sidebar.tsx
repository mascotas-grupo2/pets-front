"use client";

import { ChevronsLeft, ChevronsRight, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS, type Section } from "./admin-config";

type AdminSidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function AdminSidebar({
  collapsed,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`admin-sidebar${collapsed ? " collapsed" : ""}`}
      aria-label="Menú de administración"
    >
      <Link href="/" className="admin-sidebar-brand" aria-label="Ir al inicio">
        <img src="/images/favicon.ico" alt="" aria-hidden="true" />
        <span className="admin-brand-text">
          <span className="row1">Huellitas</span>
          <span className="row2">Unidas</span>
        </span>
      </Link>

      <nav className="admin-nav" aria-label="Secciones">
        {SECTIONS.map((item) => {
          const Icon = item.icon;
          const href = `/admin/${item.id}`;
          // Marcamos como activo si la URL coincide con la sección o si estamos en el raíz y es el dashboard
          const isActive = pathname === href || (pathname === "/admin" && item.id === "dashboard");
          return (
            <Link
              key={item.id}
              href={href}
              className={`admin-nav-item${isActive ? " active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="admin-nav-icon" size={20} aria-hidden />
              <span className="admin-nav-label">{item.label}</span>
              {item.badge != null && (
                <span className="admin-nav-badge">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className="admin-sidebar-cta"
        title={collapsed ? "Nueva publicación" : undefined}
      >
        <Plus size={18} aria-hidden />
        <span className="admin-nav-label">Nueva publicación</span>
      </button>

      <button
        type="button"
        className="admin-collapse-btn"
        onClick={onToggleCollapse}
        title={collapsed ? "Expandir menú" : "Colapsar menú"}
        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
      >
        {collapsed ? (
          <ChevronsRight size={18} aria-hidden />
        ) : (
          <ChevronsLeft size={18} aria-hidden />
        )}
        <span className="admin-nav-label">Colapsar</span>
      </button>
    </aside>
  );
}
