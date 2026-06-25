export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

/**
 * Proxy del tráfico de Socket.IO hacia el backend.
 *
 * El cliente (components/notifications/useNotifications.ts) conecta el socket al
 * MISMO origen que la app, con `path: "/api/socketio"` y transporte `polling`.
 * Acá reenviamos cada request HTTP de engine.io a `WS_BACKEND_URL/socket.io/...`,
 * preservando método, query string y body (en el body viaja el handshake con el
 * `auth.token`, que el backend lee en `socket.handshake.auth.token`).
 *
 * Se usa polling (no WebSocket) porque un route handler de Next no expone el
 * `upgrade` de la conexión; el polling es HTTP puro y sí se puede proxyear. Así el
 * backend queda detrás de Next y se expone un único origen.
 */
const WS_BACKEND_URL = process.env.WS_BACKEND_URL || "http://localhost:3001";
const PREFIX = "/api/socketio";

async function handler(req: NextRequest) {
  const url = new URL(req.url);
  // Path después de /api/socketio → se cuelga del /socket.io del backend.
  let sub = url.pathname.slice(PREFIX.length);
  if (!sub.startsWith("/")) sub = `/${sub}`;
  const target = `${WS_BACKEND_URL}/socket.io${sub}${url.search}`;

  const headers: Record<string, string> = {};
  const ct = req.headers.get("content-type");
  if (ct) headers["content-type"] = ct;
  const cookie = req.headers.get("cookie");
  if (cookie) headers.cookie = cookie;

  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = new Uint8Array(await req.arrayBuffer());
  }

  let resp: Response;
  try {
    resp = await fetch(target, init);
  } catch {
    // Backend caído/reiniciando: 502 → engine.io reintenta y el polling de
    // unread-count cubre mientras tanto.
    return new Response("socket backend unreachable", { status: 502 });
  }

  const buf = new Uint8Array(await resp.arrayBuffer());
  const outHeaders = new Headers();
  const rct = resp.headers.get("content-type");
  if (rct) outHeaders.set("content-type", rct);

  return new Response(buf, { status: resp.status, headers: outHeaders });
}

export const GET = handler;
export const POST = handler;
export const OPTIONS = handler;
