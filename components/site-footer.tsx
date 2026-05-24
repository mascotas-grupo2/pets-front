"use client";

import { useUserContext } from "@/context/UserContext";
import Link from "next/link";
import { Brand } from "./brand";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  const { isLoggedIn } = useUserContext();
  const admin_view = pathname.includes("admin");
  return (
    !admin_view && (
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
            <h4>¿Cómo te ayudamos?</h4>
            <ul>
              <li>
                <Link href="/mascotas-perdidas">Mascotas perdidas</Link>
              </li>
              {isLoggedIn ? (
                <li>
                  <Link href="/mascotas-perdidas/reportar">Reportar</Link>
                </li>
              ) : null}

              <li>
                <Link href="/care-guides">Guías de cuidado</Link>
              </li>
              <li>
                <Link href="/faq">Preguntas frecuentes</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col footer-contact">
            <h4>Contacto</h4>
            <p>📍 Av. Siempre Viva 1234, CABA</p>
            <p>📞 +54 (011) 5555-1234</p>
            <p>✉️ hola@HuellitasUnidas.app</p>
          </div>

          <div className="footer-col">
            <h4>Suscribite</h4>
            <p style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
              Recibí nuevas mascotas reportadas cerca tuyo.
            </p>
            <form
              className="footer-newsletter-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                className="input"
                placeholder="tu@email.com"
                aria-label="Email"
              />
              <button type="submit" className="btn btn-primary">
                Enviar
              </button>
            </form>
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
    )
  );
}
