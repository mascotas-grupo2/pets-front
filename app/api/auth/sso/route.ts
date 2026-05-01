import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("--- SSO Redirection Initiation ---");

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth`; 

  if (!issuer || !clientId) {
    console.error("SSO Error: Faltan variables de entorno en el servidor");
    return NextResponse.json(
      { error: "Error de configuración del servidor" },
      { status: 500 },
    );
  }

  const authUrl = `${issuer}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email&kc_idp_hint=${provider}`;

  return NextResponse.redirect(authUrl);
}
