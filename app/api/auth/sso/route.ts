import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");

  if (!provider) {
    return NextResponse.json(
      { error: "Se requiere un proveedor" },
      { status: 400 },
    );
  }

  // Obtenemos las credenciales desde variables de entorno (SOLO SERVIDOR)
  const issuer = process.env.KEYCLOAK_ISSUER;
  const clientId = process.env.KEYCLOAK_CLIENT_ID || process.env.KEYCLOAK_AUDIENCE;
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth`;

  if (!issuer || !clientId) {
    console.error("SSO Error: Faltan variables de entorno en el servidor");
    return NextResponse.json(
      { error: "Error de configuración del servidor" },
      { status: 500 },
    );
  }

  const authUrl = new URL(`${issuer}/protocol/openid-connect/auth`);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid profile email");
  authUrl.searchParams.set("kc_idp_hint", provider);

  return NextResponse.redirect(authUrl.toString());
}
