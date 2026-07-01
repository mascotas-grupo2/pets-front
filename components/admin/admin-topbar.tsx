"use client";

import { Mail, ChevronDown, LogOut, Building2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { useUserContext } from "@/context/UserContext";
import { initials } from "./sections/dashboard/dashboard.data";
import { NotificationsBell } from "../notifications/NotificationsBell";
import { ThemeToggle } from "../theme-toggle";
import { getMyRefugio } from "@/services/refugios";

type AdminTopbarProps = {
  title: string;
  subtitle: string;
};

/**
 * Indicador de refugio del panel: para el admin de refugio muestra el nombre de
 * su refugio (solo lectura). El superadmin solo gestiona Personas y Refugios, no
 * tiene un refugio "en vista", así que no se muestra nada.
 */
function RefugioIndicator() {
  const role = useAppSelector((state) => state.user.role);
  const refugioId = useAppSelector((state) => state.user.refugioId);
  const [myName, setMyName] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "superadmin" && refugioId != null) {
      getMyRefugio().then((r) => {
        if (r.ok && r.data) setMyName(r.data.name);
      });
    }
  }, [role, refugioId]);

  if (!myName) return null;
  return (
    <span className="admin-refugio-chip" title="Tu refugio">
      <Building2 size={16} aria-hidden />
      {myName}
    </span>
  );
}

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
        <RefugioIndicator />

        <ThemeToggle />

        <NotificationsBell />

        <Link
          href="/admin/mensajes"
          className="admin-icon-btn"
          aria-label="Mensajes"
          title="Mensajes"
        >
          <Mail size={18} aria-hidden />
        </Link>

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
