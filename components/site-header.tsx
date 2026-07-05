"use client";

import { useEffect, useState } from "react";
import { useUserContext } from "@/context/UserContext";
import { useAppSelector } from "@/redux/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";
import { NotificationsBell } from "./notifications/NotificationsBell";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/mascotas-perdidas", label: "Mascotas perdidas" },
  { href: "/adoptar", label: "Adoptar" },
  { href: "/care-guides", label: "Guías" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { isLoggedIn } = useUserContext();
  const role = useAppSelector((state) => state.user.role);
  // El superadmin también accede al panel (para gestionar Refugios y Usuarios).
  const isAdmin = role === "admin" || role === "superadmin";
  const [menuOpen, setMenuOpen] = useState(false);

  // "Adoptar" queda siempre visible, incluso si la persona ya completó el
  // formulario de adoptante (puede seguir explorando mascotas en adopción).
  const navItems = NAV;

  // Cerrar el drawer al navegar.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Bloquear el scroll del body mientras el drawer está abierto.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // El panel de administración usa su propio menú lateral, sin el header público.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
    <header className="site-header">
      <div className="container">
        <Brand />

        <nav className="nav" aria-label="Navegación principal">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "active" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          {isLoggedIn && <NotificationsBell />}
          <div className="header-actions-desktop">
            {isAdmin && (
              <Link
                href="/admin"
                className="btn btn-outline btn-sm"
                title="Panel de admin"
              >
                Admin
              </Link>
            )}
            {isLoggedIn ? (
              <Link
                href="/mascotas-perdidas/reportar"
                className="btn btn-primary btn-sm"
              >
                Reportar
              </Link>
            ) : (
              <div className="tooltip-container">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ opacity: 0.5, cursor: "not-allowed" }}
                >
                  Reportar
                </button>
                <span className="tooltip-content">Necesitás iniciar sesión</span>
              </div>
            )}
            {isLoggedIn ? (
              <Link href="/account" className="btn btn-outline btn-sm">
                Mi Cuenta
              </Link>
            ) : (
              <Link href="/login" className="btn btn-outline btn-sm">
                Ingresar
              </Link>
            )}
          </div>

          <button
            type="button"
            className="nav-toggle"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>
    </header>

      {/* Drawer de navegación para mobile (fuera del header: su backdrop-filter
          rompería el position:fixed del overlay/drawer) */}
      <div
        className={`mobile-drawer-overlay${menuOpen ? " open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden
      />
      <aside
        className={`mobile-drawer${menuOpen ? " open" : ""}`}
        aria-label="Menú de navegación"
        aria-hidden={!menuOpen}
      >
        <nav className="mobile-drawer-nav">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "active" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mobile-drawer-actions">
          {isAdmin && (
            <Link
              href="/admin"
              className="btn btn-outline"
              onClick={() => setMenuOpen(false)}
            >
              Panel de admin
            </Link>
          )}
          {isLoggedIn ? (
            <Link
              href="/mascotas-perdidas/reportar"
              className="btn btn-primary"
              onClick={() => setMenuOpen(false)}
            >
              Reportar
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn btn-primary"
              onClick={() => setMenuOpen(false)}
            >
              Reportar
            </Link>
          )}
          {isLoggedIn ? (
            <Link
              href="/account"
              className="btn btn-outline"
              onClick={() => setMenuOpen(false)}
            >
              Mi Cuenta
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn btn-outline"
              onClick={() => setMenuOpen(false)}
            >
              Ingresar
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
