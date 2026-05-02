import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: "No refresh token found" },
      { status: 401 },
    );
  }

  const issuer = process.env.KEYCLOAK_ISSUER;
  const clientId =
    process.env.KEYCLOAK_CLIENT_ID || process.env.KEYCLOAK_AUDIENCE;
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", clientId!);
    if (clientSecret) params.append("client_secret", clientSecret);
    params.append("refresh_token", refreshToken);

    const tokenUrl = `${issuer}/protocol/openid-connect/token`;
    const tokenResponse = await axios.post(tokenUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const { access_token, refresh_token: new_refresh_token } =
      tokenResponse.data;

    const response = NextResponse.json({ ok: true });

    // Actualizamos las cookies
    response.cookies.set("auth_token", access_token, {
      path: "/",
      maxAge: 3600,
      secure: process.env.NODE_ENV === "production",
    });

    if (new_refresh_token) {
      response.cookies.set("refresh_token", new_refresh_token, {
        path: "/",
        maxAge: 3600 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error) {
    console.error("Token refresh failed:", error);
    const response = NextResponse.json(
      { error: "Refresh failed" },
      { status: 401 },
    );
    // Si el refresh falla, limpiamos las cookies para forzar re-login
    response.cookies.delete("auth_token");
    response.cookies.delete("refresh_token");
    return response;
  }
}
