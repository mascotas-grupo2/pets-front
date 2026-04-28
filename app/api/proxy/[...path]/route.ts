export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import axios from "axios";

/**
 * Handler genérico para actuar como proxy transparente
 */
async function handleRequest(request: Request) {
  const url = new URL(request.url);

  const path = url.pathname.split("/api/proxy/")[1] || "";
  const search = url.search;

  // Limpiamos el BACKEND_URL de barras al final y el path de barras al inicio
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001/api"
  const cleanPath = path.replace(/^\//, "");
  const targetUrl = `${BACKEND_URL}/${cleanPath}${search}`;

  // Convertimos los headers de la Request a un objeto plano para Axios
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    // El header 'host' debe ser omitido para que Axios/Servidor use el correcto
    if (key.toLowerCase() !== "host" && key.toLowerCase() !== "connection") {
      headers[key] = value;
    }
  });


  try {
    let body = null;
    if (!["GET", "HEAD"].includes(request.method)) {
      // Leemos el cuerpo como ArrayBuffer para mantener la integridad de cualquier tipo de dato
      body = await request.arrayBuffer();

    }
    const response = await axios({
      method: request.method,
      url: targetUrl,
      data: body,
      headers: headers,
      responseType: "arraybuffer", 
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      validateStatus: () => true,  
    });
    return new NextResponse(response.data, {
      status: response.status,
      headers: {
        "Content-Type": (response.headers["content-type"] as string) || "application/json",
      },
    });
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