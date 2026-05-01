import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const errorKeycloak = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  console.log("--- SSO Callback Debug ---", searchParams);
  console.log("Full URL:", request.url);

  if (errorKeycloak) {
    console.error("Keycloak returned an error:", errorKeycloak, "-", errorDescription);
    return NextResponse.redirect(new URL(`/login?error=${errorKeycloak}`, request.url));
  }

  if (!code) {
    console.error("Error: No auth code or error found in searchParams");
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  // Priorizamos KEYCLOAK_CLIENT_ID, luego KEYCLOAK_AUDIENCE
  const issuer = process.env.KEYCLOAK_ISSUER; // http://localhost:8080/realms/pets
  const clientId = process.env.KEYCLOAK_CLIENT_ID || process.env.KEYCLOAK_AUDIENCE; 
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET; // Si el cliente es "confidential"
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3001/api";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth`; // Debe coincidir exactamente con el enviado en sso/route.ts

  console.log("Environment Variables:");
  console.log("- KEYCLOAK_ISSUER:", issuer);
  console.log("- CLIENT_ID:", clientId);
  console.log("- REDIRECT_URI:", redirectUri);

  if (!issuer) throw new Error("KEYCLOAK_ISSUER is not defined in .env");

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

    const { access_token, id_token } = tokenResponse.data;
    console.log("Token exchange successful!");

    // 1.5. Sincronizar con el Backend (Just-in-Time Provisioning)
    // Enviamos el token al backend para que cree el usuario en su DB local si no existe
    try {
      console.log("Syncing user with backend...");
      await axios.post(`${backendUrl}/auth/sso-sync`, {}, {
        headers: { 
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json"
        },
      });
      console.log("User synchronization successful");
    } catch (syncError) {
      // Si falla la sincronización, podrías decidir si dejarlo pasar o no.
      // Aquí lo logueamos pero permitimos continuar, aunque lo ideal es que el backend responda OK.
      console.error("Backend Sync failed. Is the sync endpoint implemented?");
      // return NextResponse.redirect(new URL("/login?error=sync_failed", request.url));
    }

    // 2. Redirigimos al usuario a la app con el token
    // Lo más común es ponerlo en una cookie para que Redux lo lea al cargar
    const response = NextResponse.redirect(new URL("/account", request.url));
    console.log("Redirecting to /account", tokenResponse);

    // Guardamos el token en una cookie (puedes ponerla HttpOnly si tenés un endpoint /api/me)
    response.cookies.set("auth_token", access_token, {
      path: "/",
      maxAge: 3600, // 1 hora
      secure: process.env.NODE_ENV === "production",
    });
    
    // Guardamos el id_token (contiene info de perfil) para que el cliente lo lea
    response.cookies.set("id_token_hint", id_token, {
      path: "/",
      maxAge: 3600,
      httpOnly: false, // Permitimos que JS lo lea para hidratar el estado inicial
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("SSO Token Exchange Error (Axios):", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        configUrl: error.config?.url
      });
    } else {
      console.error("SSO Callback Error (Unknown):", error);
    }
    return NextResponse.redirect(new URL("/login?error=sso_failed", request.url));
  }
}