import axios from "axios";
import type { Mensaje } from "@/services/chat";

/** Evento empujado por el servidor (mensaje nuevo en una conversación). */
export type ChatEvent = { type: "message"; conversationId: string; message: Mensaje };

type Listener = (event: ChatEvent) => void;

/**
 * Transporte de chat en tiempo real. La UI sólo conoce esta interfaz, así que
 * la implementación (WebSocket real, mock, etc.) es intercambiable.
 */
export interface ChatTransport {
  subscribe(listener: Listener): () => void;
  send(conversationId: string, text: string): void;
  close(): void;
}

/**
 * Implementación sobre WebSocket nativo: encola los envíos hasta que la conexión
 * esté abierta, obteniendo la configuración desde la API interna.
 */
export function createWebSocketTransport(): ChatTransport {
  const listeners = new Set<Listener>();
  let socket: WebSocket | null = null;
  let pending: string[] = [];
  let closedByUser = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  async function connect() {
    try {
      // Obtenemos la URL de conexión desde nuestra API interna (BFF)
      const res = await axios.get<{ url: string }>("/api/chat");
      const { url } = res.data;

      socket = new WebSocket(url);

      socket.onopen = () => {
        pending.forEach((frame) => socket?.send(frame));
        pending = [];
      };

      socket.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data) as ChatEvent;
          if (event.type === "message") listeners.forEach((l) => l(event));
        } catch { /* ignore */ }
      };

      socket.onclose = () => {
        socket = null;
        if (!closedByUser) reconnectTimer = setTimeout(connect, 2000);
      };

      socket.onerror = () => socket?.close();
    } catch (err) {
      console.error("ChatTransport connect error:", err);
      if (!closedByUser) reconnectTimer = setTimeout(connect, 5000);
    }
  }

  connect();

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    send(conversationId, text) {
      const frame = JSON.stringify({ type: "message", conversationId, text });
      if (socket?.readyState === WebSocket.OPEN) socket.send(frame);
      else pending.push(frame);
    },
    close() {
      closedByUser = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    },
  };
}
