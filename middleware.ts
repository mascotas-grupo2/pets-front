import { NextResponse, type NextRequest } from "next/server";

/**
 * Lee el claim `role` del payload de un JWT SIN verificar la firma.
 * Sirve solo como gate de UX/existencia: la autorización real la hace el
 * backend (`requireAdmin`). Decodificar alcanza para no servir el panel a
 * usuarios normales; un token forjado igual sería rechazado por el backend.
 */
function roleFromToken(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const data = JSON.parse(json) as { role?: unknown };
    return typeof data.role === "string" ? data.role : null;
  } catch {
    return null;
  }
}

/**
 * Gate server-side del panel admin: corre ANTES de renderizar `/admin`, así un
 * no-admin nunca recibe el HTML/JS del panel (no "descubre" que existe).
 * Deny-by-default: solo pasa con un token cuyo rol sea "admin".
 *
 * Nota: para usuarios SSO (Keycloak) el rol puede no venir como claim plano
 * `role`; si en el futuro hay admins por Keycloak, habría que verificar el
 * token con la clave y mapear el rol.
 */
export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (roleFromToken(token) !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
