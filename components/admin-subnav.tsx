"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/mascotas-perdidas", label: "Mascotas" },
  { href: "/admin/usuarios", label: "Usuarios" },
];

export function AdminSubnav() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="admin-subnav" aria-label="Secciones de admin">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`admin-subnav-link${active ? " active" : ""}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
