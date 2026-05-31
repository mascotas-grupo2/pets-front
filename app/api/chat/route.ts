import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Este endpoint "ofusca" la ubicación del servidor de WebSocket.
 * El cliente llama a /api/chat/config y recibe la URL firmada.
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // La URL del backend ahora es PRIVADA (sin NEXT_PUBLIC_)
  const WS_BACKEND_URL = process.env.WS_BACKEND_URL || "ws://localhost:3001/ws/chat";

  // Podés agregar lógica para pedir un "ticket" de conexión al backend real aquí
  // o simplemente pasar el token en la query string de forma segura.
  // El navegador enviará las cookies automáticamente si es el mismo dominio,
  // pero si el WS está en otro host, lo pasamos por query:
  const connectionUrl = `${WS_BACKEND_URL}?t=${token}`;

  return NextResponse.json({
    url: connectionUrl,
    // Podés pasar aquí configuraciones adicionales del chat
    options: { reconnect: true }
  });
}
