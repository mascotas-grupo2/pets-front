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

/** URL del WebSocket de chat (configurable por env). */
export function chatWsUrl(): string {
  return process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001/ws/chat";
}

/**
 * Implementación sobre WebSocket nativo: encola los envíos hasta que la conexión
 * esté abierta y reintenta la conexión si se cae.
 */
export function createWebSocketTransport(url: string): ChatTransport {
  const listeners = new Set<Listener>();
  let socket: WebSocket | null = null;
  let pending: string[] = [];
  let closedByUser = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function connect() {
    socket = new WebSocket(url);

    socket.onopen = () => {
      pending.forEach((frame) => socket?.send(frame));
      pending = [];
    };

    socket.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as ChatEvent;
        if (event.type === "message") listeners.forEach((l) => l(event));
      } catch {
        /* frame no-JSON: lo ignoramos */
      }
    };

    socket.onclose = () => {
      socket = null;
      if (!closedByUser) reconnectTimer = setTimeout(connect, 1500);
    };

    socket.onerror = () => socket?.close();
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
