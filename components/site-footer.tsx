"use client";

import { useUserContext } from "@/context/UserContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "./brand";

export function SiteFooter() {
  const { isLoggedIn } = useUserContext();
  const pathname = usePathname();
  // El panel de administración usa su propio layout, sin el footer público.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-col">
          <Brand />
          <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
            Comunidad para reportar y encontrar mascotas perdidas. Juntos las
            reunimos con sus familias.
          </p>
        </div>

        <div className="footer-col">
          <h4>Explorar</h4>
          <ul>
            <li>
              <Link href="/mascotas-perdidas">Mascotas perdidas</Link>
            </li>
            <li>
              <Link href="/adoptar">Adoptar</Link>
            </li>
            {isLoggedIn ? (
              <li>
                <Link href="/mascotas-perdidas/reportar">Reportar</Link>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Recursos</h4>
          <ul>
            <li>
              <Link href="/care-guides">Guías de cuidado</Link>
            </li>
            <li>
              <Link href="/faq">Preguntas frecuentes</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <span>©2026 Huellitas Unidas. Todos los derechos reservados.</span>
          <div className="footer-social" aria-label="Redes sociales">
            <a href="#" aria-label="Facebook">
              f
            </a>
            <a href="#" aria-label="Instagram">
              ig
            </a>
            <a href="#" aria-label="Twitter">
              x
            </a>
            <a href="#" aria-label="YouTube">
              yt
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
