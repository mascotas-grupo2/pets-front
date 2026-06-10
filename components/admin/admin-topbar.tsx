"use client";

import { Search, Bell, Mail, ChevronDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { useUserContext } from "@/context/UserContext";
import { initials } from "./sections/dashboard/dashboard.data";

type AdminTopbarProps = {
  title: string;
  subtitle: string;
};

export function AdminTopbar({ title, subtitle }: AdminTopbarProps) {
  const { logout } = useUserContext();
  const userName = useAppSelector((state) => state.user.name) || "Admin Refugio";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-heading">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="admin-topbar-actions">
        <div className="admin-search">
          <Search size={16} aria-hidden />
          <input type="search" placeholder="Buscar..." aria-label="Buscar" />
        </div>

        <button type="button" className="admin-icon-btn" aria-label="Notificaciones">
          <Bell size={18} aria-hidden />
          <span className="admin-icon-badge">0</span>
        </button>

        <button type="button" className="admin-icon-btn" aria-label="Mensajes">
          <Mail size={18} aria-hidden />
          <span className="admin-icon-badge admin-icon-badge-accent">3</span>
        </button>

        <div className="admin-user-menu-wrap" ref={menuRef}>
          <button
            type="button"
            className="admin-user-chip"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="admin-user-avatar" aria-hidden>
              {initials(userName)}
            </span>
            <span className="admin-user-name">{userName}</span>
            <ChevronDown size={16} aria-hidden />
          </button>

          {menuOpen && (
            <div className="admin-user-menu" role="menu">
              <button
                type="button"
                className="admin-user-menu-item"
                role="menuitem"
                onClick={() => void logout()}
              >
                <LogOut size={16} aria-hidden />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
