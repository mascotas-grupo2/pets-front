"use client";

import { ChevronsLeft, ChevronsRight, Plus } from "lucide-react";
import { SECTIONS, type Section } from "./admin-config";

type AdminSidebarProps = {
  active: Section;
  onSelect: (section: Section) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function AdminSidebar({
  active,
  onSelect,
  collapsed,
  onToggleCollapse,
}: AdminSidebarProps) {
  return (
    <aside
      className={`admin-sidebar${collapsed ? " collapsed" : ""}`}
      aria-label="Menú de administración"
    >
      <div className="admin-sidebar-brand">
        <img src="/images/favicon.ico" alt="" />
        <span className="admin-brand-text">
          <span className="row1">Huellitas</span>
          <span className="row2">Unidas</span>
        </span>
      </div>

      <nav className="admin-nav" aria-label="Secciones">
        {SECTIONS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`admin-nav-item${isActive ? " active" : ""}`}
              onClick={() => onSelect(item.id)}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="admin-nav-icon" size={20} aria-hidden />
              <span className="admin-nav-label">{item.label}</span>
              {item.badge != null && (
                <span className="admin-nav-badge">{item.badge}</span>
              )}
            </button>
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
