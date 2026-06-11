import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { signUserData } from "@/lib/auth-signature";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const errorKeycloak = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const issuer = process.env.KEYCLOAK_ISSUER;
  const clientId =
    process.env.KEYCLOAK_CLIENT_ID || process.env.KEYCLOAK_AUDIENCE;
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3001/api";
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth`;

  // Si ya tenemos un token activo, ignoramos el proceso de intercambio
  // Esto evita errores de "code already used" si el navegador reintenta la petición
  const existingToken = request.cookies.get("auth_token");
  if (existingToken && !errorKeycloak && code) {
    return NextResponse.redirect(new URL("/", baseUrl));
  }

  if (errorKeycloak) {
    console.error(
      "Keycloak returned an error:",
      errorKeycloak,
      "-",
      errorDescription,
    );
    return NextResponse.redirect(
      new URL(`/login?error=${errorKeycloak}`, baseUrl),
    );
  }

  if (!code) {
    console.error("Error: No auth code or error found in searchParams");
    return NextResponse.redirect(new URL("/login?error=no_code", baseUrl));
  }

  try {
    // 1. Intercambiamos el código por tokens (Server to Server)
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", clientId!);
    if (clientSecret) params.append("client_secret", clientSecret);
    params.append("code", code);
    params.append("redirect_uri", redirectUri);

    const tokenUrl = `${issuer}/protocol/openid-connect/token`;
    console.log("Attempting token exchange at:", tokenUrl);

    const tokenResponse = await axios.post(tokenUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const { access_token, id_token, refresh_token } = tokenResponse.data;
    console.log("Token exchange successful!");

    // const idTokenPayload = JSON.parse(
    //   Buffer.from(id_token.split(".")[1], "base64").toString(),
    // );

    // if (
    //   idTokenPayload.identity_provider !== "google" &&
    //   idTokenPayload.email_verified !== true
    // ) {
    //   return NextResponse.redirect(
    //     new URL("/login?error=email_unverified", baseUrl),
    //   );
    // }

    // 1.5. Sincronizar con el Backend (Just-in-Time Provisioning)
    // Enviamos el token al backend para que cree el usuario en su DB local si no existe
    let ssoUser = null;
    try {
      const syncRes = await axios.post(
        `${backendUrl}/auth/sso-sync`,
        {},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Extraemos el usuario que devuelve el backend para procesarlo
      const rawUser = syncRes.data?.user || syncRes.data?.data || syncRes.data;
      if (rawUser) {
        const cleanUser = {
          isLoggedIn: true,
          name: rawUser.name || "",
          role: rawUser.role || "user",
          adopter: !!rawUser.adopter,
        };
        // Aplicamos la firma digital para proteger la integridad en el cliente
        const signature = signUserData(cleanUser);
        ssoUser = { ...cleanUser, signature };
        console.log("User synchronization and local signature successful");
      }
    } catch (syncError) {
      console.error(
        "Backend Sync failed. User not persisted in DB:",
        syncError,
      );
      // Si el back falla, es mejor no dejarlo entrar porque no podrá realizar acciones
      return NextResponse.redirect(
        new URL("/login?error=db_sync_error", baseUrl),
      );
    }

    // 2. Redirigimos al usuario a la app con el token
    // Lo más común es ponerlo en una cookie para que Redux lo lea al cargar
    const response = NextResponse.redirect(new URL("/", baseUrl));
    console.log("Redirecting to / (home) - Session established");

    // auth_token NO httpOnly: el front lo lee desde JS (UserContext).
    response.cookies.set("auth_token", access_token, {
      path: "/",
      maxAge: 3600, // 1 hora
      secure: process.env.NODE_ENV === "production",
    });

    // Guardamos el refresh_token en una cookie HttpOnly para que el interceptor pueda usarla
    response.cookies.set("refresh_token", refresh_token, {
      path: "/",
      maxAge: 3600 * 24 * 7, // 7 días (ajustar según configuración de Keycloak)
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    // Guardamos el id_token (contiene info de perfil) para que el cliente lo lea
    response.cookies.set("id_token_hint", id_token, {
      path: "/",
      maxAge: 3600,
      httpOnly: false, // Permitimos que JS lo lea para hidratar el estado inicial
      secure: process.env.NODE_ENV === "production",
    });

    // Entregamos el objeto de usuario ya filtrado y firmado en una cookie temporal.
    // El UserContext podrá leer esto para una hidratación ultra rápida.
    if (ssoUser) {
      response.cookies.set("sso_user_data", JSON.stringify(ssoUser), {
        path: "/",
        maxAge: 60, // Corta duración, solo para la hidratación inicial tras el redirect
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("SSO Token Exchange Error (Axios):", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        configUrl: error.config?.url,
      });
    } else {
      console.error("SSO Callback Error (Unknown):", error);
    }
    return NextResponse.redirect(new URL("/login?error=sso_failed", baseUrl));
  }
}
