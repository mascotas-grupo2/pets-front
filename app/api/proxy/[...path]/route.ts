export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { signUserData } from "@/lib/auth-signature";

/**
 * Handler genérico para actuar como proxy transparente
 */
async function handleRequest(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();

  const path = url.pathname.split("/api/proxy/")[1] || "";
  const search = url.search;

  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001/api";
  const cleanPath = path.replace(/^\//, "");
  const targetUrl = `${BACKEND_URL}/${cleanPath}${search}`;

  // Helper para realizar la petición al backend (permite reintentos)
  const forwardRequest = async (tokenOverride?: string) => {
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      if (
        !["host", "connection", "content-length"].includes(key.toLowerCase())
      ) {
        headers[key] = value;
      }
    });

    // Usamos el token de reintento o el que está en las cookies
    const token = tokenOverride || cookieStore.get("auth_token")?.value;
    if (token) {
      headers["authorization"] = `Bearer ${token}`;
    }

    let body = null;
    if (!["GET", "HEAD"].includes(request.method)) {
      // Clonamos para que el body se pueda leer de nuevo si hay reintento
      body = await request.clone().arrayBuffer();
    }

    return axios({
      method: request.method,
      url: targetUrl,
      data: body,
      withCredentials: true,
      headers: headers,
      responseType: "arraybuffer",
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      validateStatus: () => true,
    });
  };

  try {
    let response = await forwardRequest();
    let refreshedTokens: { access: string; refresh?: string } | null = null;
    // 1. Manejo automático de Refresh en caso de 401
    if (response.status === 401) {
      const pathLower = cleanPath.toLowerCase();
      if (pathLower.includes("auth/login")) {
        return new NextResponse(new TextDecoder().decode(response.data), {
          status: 401,
          headers: {
            "Content-Type": (response.headers["content-type"] as string) || "application/json",
          },
        });
      }

      const refreshToken = cookieStore.get("refresh_token")?.value;
      if (refreshToken) {
        try {
          // Si existe 'id_token_hint', es un usuario de Keycloak
          if (cookieStore.has("id_token_hint")) {
            const issuer = process.env.KEYCLOAK_ISSUER;
            const clientId =
              process.env.KEYCLOAK_CLIENT_ID || process.env.KEYCLOAK_AUDIENCE;
            const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

            const kcRes = await axios.post(
              `${issuer}/protocol/openid-connect/token`,
              new URLSearchParams({
                grant_type: "refresh_token",
                client_id: clientId!,
                refresh_token: refreshToken,
                ...(clientSecret ? { client_secret: clientSecret } : {}),
              }),
            );
            refreshedTokens = {
              access: kcRes.data.access_token,
              refresh: kcRes.data.refresh_token,
            };
          } else {
            // Usuario manual: Llamada al endpoint de refresh de tu backend propio
            const manualRes = await axios.post(
              `${BACKEND_URL}/auth/refresh-token`,
              { refreshToken },
            );
            const body = manualRes.data;
            refreshedTokens = {
              access: body.access_token || body.token,
              refresh: body.refresh_token || body.refreshToken,
            };
          }

          if (refreshedTokens?.access) {
            response = await forwardRequest(refreshedTokens.access);
          }
        } catch (e) {
          console.error("Proxy: Refresh falló definitivamente");
        }
      } else {
        // Si no es un login y no hay refresh_token, la sesión expiró o es inexistente
        return NextResponse.json(
          { message: "Unauthorized - Please log in again" },
          { status: 401 },
        );
      }
    }

    // 2. Interceptar endpoints de Auth/Perfil para filtrar y firmar datos
    const pathLower = cleanPath.toLowerCase();
    const isAuthAction =
      pathLower.includes("auth/login") ||
      pathLower.includes("auth/register") ||
      pathLower.includes("auth/verify-email") ||
      pathLower.includes("user/commonInfo") ||
      pathLower.includes("pet/adoptar");

    let accessToSet = refreshedTokens?.access;
    let refreshToSet = refreshedTokens?.refresh;
    let filteredData = response.data;

    if (isAuthAction && response.status >= 200 && response.status < 300) {
      try {
        const rawJson = JSON.parse(new TextDecoder().decode(response.data));
        const userObj = rawJson.user || rawJson.data || rawJson;

        // Mapeamos solo los campos esenciales definidos en la interfaz User (types/user.ts)
        // Esto evita exponer datos sensibles o innecesarios en el cliente
        const cleanUser = {
          isLoggedIn: true,
          id: userObj.id,
          name: userObj.name || "",
          email: userObj.email || "",
          role: userObj.role || "user",
          adopter: !!userObj.adopter,
        };

        // Generamos la firma digital para proteger la integridad de los datos en el cliente
        const signature = signUserData(cleanUser);
        const finalResponse = { ...cleanUser, signature };

        // Re-empaquetamos los datos filtrados para el cliente
        filteredData = JSON.stringify(finalResponse);

        // Extraemos tokens para las cookies si no fueron refrescados arriba
        accessToSet =
          rawJson.access_token || rawJson.data?.access_token || rawJson.token || accessToSet;
        refreshToSet =
          rawJson.refresh_token || rawJson.data?.refresh_token || rawJson.refreshToken || refreshToSet;
      } catch (e) {
        /* no json */
      }
    }

    // 204/205/304 deben tener body null (la spec de Response lo exige)
    const noBodyStatus = response.status === 204 || response.status === 205 || response.status === 304;
    const nextResponse = new NextResponse(noBodyStatus ? null : filteredData, {
      status: response.status,
      headers: noBodyStatus
        ? {}
        : {
            "Content-Type":
              (response.headers["content-type"] as string) || "application/json",
          },
    });

    // 3. Seteo de Cookies (Persistencia)
    if (accessToSet) {
      nextResponse.cookies.set("auth_token", accessToSet, {
        path: "/",
        maxAge: 3600,
        // auth_token NO httpOnly: el front lo lee desde JS (UserContext).
        secure: process.env.NODE_ENV === "production",
      });
    }
    if (refreshToSet) {
      nextResponse.cookies.set("refresh_token", refreshToSet, {
        path: "/",
        maxAge: 3600 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }

    return nextResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isBackendOffline =
      (error as { code?: string }).code === "ECONNREFUSED";
    const level = isBackendOffline ? "warn" : "error";
    console[level](
      `Proxy ${request.method} ${cleanPath} → ${isBackendOffline ? "backend offline" : message}`,
    );
    return NextResponse.json(
      {
        message: isBackendOffline
          ? "Backend offline"
          : "Error de comunicación proxy",
      },
      { status: isBackendOffline ? 503 : 500 },
    );
  }
}

// Exportamos todos los verbos HTTP que necesites
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
