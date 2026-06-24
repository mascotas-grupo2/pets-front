import { NextResponse, type NextRequest } from "next/server";

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

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  // Si no hay token de acceso, intentar un refresh server-side si existe
  if (!token) {
    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (refreshToken) {
      try {
        const proxyUrl = `${req.nextUrl.origin}/api/proxy/auth/refresh-token`;
        // Forward cookies desde la request original para que el proxy pueda
        // leer el refresh_token via `cookies()` de next/headers.
        const cookieHeader = req.headers.get("cookie") || "";
        const res = await fetch(proxyUrl, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(cookieHeader ? { cookie: cookieHeader } : {}),
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (res.ok) {
          const body = await res.json().catch(() => ({}));
          const newAccess = body.access_token || body.token || body.accessToken;
          const newRefresh = body.refresh_token || body.refreshToken || null;

          if (newAccess) {
            const nextRes = NextResponse.next();
            nextRes.cookies.set("auth_token", String(newAccess), {
              path: "/",
              maxAge: 3600,
              secure: process.env.NODE_ENV === "production",
            });
            if (newRefresh) {
              nextRes.cookies.set("refresh_token", String(newRefresh), {
                path: "/",
                maxAge: 3600 * 24 * 7,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
              });
            }

            // Verificamos rol con el nuevo token
            if (!["admin", "superadmin"].includes(roleFromToken(String(newAccess)) ?? "")) {
              const url = req.nextUrl.clone();
              url.pathname = "/";
              return NextResponse.redirect(url);
            }

            return nextRes;
          }
        }
      } catch {
        // Si el refresh server-side falla, caemos al redirect a /login de abajo.
      }
    }

    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!["admin", "superadmin"].includes(roleFromToken(token) ?? "")) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
