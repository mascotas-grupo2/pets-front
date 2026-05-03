"use client";

import { useUserContext } from "@/context/UserContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./brand";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/mascotas-perdidas", label: "Mascotas perdidas" },
  { href: "/adoptar", label: "Adoptar" },
  { href: "/care-guides", label: "Guías" },
  { href: "/about", label: "Nosotros" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { isLoggedIn, adopter } = useUserContext();

  return (
    <header className="site-header">
      <div className="container">
        <Brand />

        <nav className="nav" aria-label="Navegación principal">
          {NAV.filter((item) =>
            adopter ? item.label != "Adoptar" : item.label,
          ).map((item) => {
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
      </div>
    </header>
  );
}
