import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("--- SSO Redirection Initiation ---");

  // PRUEBA RÁPIDA: Si ves esto en el navegador, la ruta SÍ existe.
  // return NextResponse.json({ message: "La ruta sso funciona" });

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");

  if (!provider) {
    return NextResponse.json(
      { error: "Se requiere un proveedor" },
      { status: 400 },
    );
  }

  // Obtenemos las credenciales desde variables de entorno (SOLO SERVIDOR)
  const issuer = process.env.KEYCLOAK_ISSUER; // http://localhost:8080/realms/pets
  const clientId = process.env.KEYCLOAK_CLIENT_ID || process.env.KEYCLOAK_AUDIENCE;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth`; // Cambiado para coincidir con app/api/auth/route.ts

  console.log("Client ID being used:", clientId); // Agregado para depuración
  console.log("Issuer:", issuer);
  console.log("Redirect URI sent to Keycloak:", redirectUri);

  if (!issuer || !clientId) {
    console.error("SSO Error: Faltan variables de entorno en el servidor");
    return NextResponse.json(
      { error: "Error de configuración del servidor" },
      { status: 500 },
    );
  }

  // Construimos la URL de Keycloak.
  // kc_idp_hint fuerza a Keycloak a saltarse su propio login y usar el IDP social directamente.
  const authUrl = `${issuer}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email&kc_idp_hint=${provider}`;

  return NextResponse.redirect(authUrl);
}
