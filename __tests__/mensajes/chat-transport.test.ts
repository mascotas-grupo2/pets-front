import { createWebSocketTransport } from "@/components/admin/sections/mensajes/chat-transport";
import type { ChatEvent } from "@/components/admin/sections/mensajes/chat-transport";

/** WebSocket falso controlable para no abrir conexiones reales. */
class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  static OPEN = 1;
  readyState = 0;
  sent: string[] = [];
  onopen?: () => void;
  onmessage?: (e: { data: string }) => void;
  onclose?: () => void;
  onerror?: () => void;

  constructor(public url: string) {
    FakeWebSocket.instances.push(this);
  }
  send(data: string) {
    this.sent.push(data);
  }
  close() {
    this.readyState = 3;
    this.onclose?.();
  }
  // Helpers de test
  open() {
    this.readyState = 1;
    this.onopen?.();
  }
  receive(data: string) {
    this.onmessage?.({ data });
  }
}

beforeEach(() => {
  FakeWebSocket.instances = [];
  (global as unknown as { WebSocket: unknown }).WebSocket = FakeWebSocket;
});

describe("createWebSocketTransport", () => {
  it("encola los envíos hasta que la conexión abre y luego los manda", () => {
    const t = createWebSocketTransport("ws://test/chat");
    const ws = FakeWebSocket.instances[0];

    t.send("c1", "hola"); // todavía CONNECTING → encolado
    expect(ws.sent).toHaveLength(0);

    ws.open();
    expect(ws.sent).toHaveLength(1);
    expect(JSON.parse(ws.sent[0])).toEqual({ type: "message", conversationId: "c1", text: "hola" });

    t.send("c1", "otra"); // ya abierto → directo
    expect(ws.sent).toHaveLength(2);
  });

  it("entrega a los suscriptores los mensajes entrantes", () => {
    const t = createWebSocketTransport("ws://test/chat");
    const ws = FakeWebSocket.instances[0];
    const recibidos: ChatEvent[] = [];
    t.subscribe((e) => recibidos.push(e));
    ws.open();

    const event: ChatEvent = {
      type: "message",
      conversationId: "c1",
      message: { id: "m1", senderUserId: 7, senderName: "María", texto: "hola", createdAt: "2026-05-30T10:00:00Z" },
    };
    ws.receive(JSON.stringify(event));

    expect(recibidos).toEqual([event]);
  });

  it("ignora frames que no son JSON válido", () => {
    const t = createWebSocketTransport("ws://test/chat");
    const ws = FakeWebSocket.instances[0];
    const recibidos: ChatEvent[] = [];
    t.subscribe((e) => recibidos.push(e));
    ws.open();

    expect(() => ws.receive("no-json")).not.toThrow();
    expect(recibidos).toHaveLength(0);
  });

  it("close() no reabre la conexión", () => {
    const t = createWebSocketTransport("ws://test/chat");
    expect(FakeWebSocket.instances).toHaveLength(1);
    t.close();
    // El cierre fue intencional: no debe crear una nueva instancia.
    expect(FakeWebSocket.instances).toHaveLength(1);
  });
});
