"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./brand";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/mascotas-perdidas", label: "Mascotas perdidas" },
  { href: "/care-guides", label: "Guías" },
  { href: "/about", label: "Nosotros" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="container">
        <Brand />

        <nav className="nav" aria-label="Navegación principal">
          {NAV.map((item) => {
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
          <Link href="/mascotas-perdidas/reportar" className="btn btn-primary btn-sm">
            Reportar
          </Link>
          <Link href="/login" className="btn btn-outline btn-sm">
            Ingresar
          </Link>
        </div>
      </div>
    </header>
  );
}
