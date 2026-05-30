import userEvent from "@testing-library/user-event";
import { renderWithStore, screen, waitFor, within } from "@/test/render";
import { makeUser } from "@/test/factories";
import { MensajesSection } from "@/components/admin/sections/mensajes/mensajes-section";
import type { ChatEvent, ChatTransport } from "@/components/admin/sections/mensajes/chat-transport";
import type { Conversacion, Mensaje } from "@/services/chat";

jest.mock("@/services/chat", () => ({
  getConversations: jest.fn(),
  getMessages: jest.fn(),
  markConversationRead: jest.fn(),
}));
import { getConversations, getMessages, markConversationRead } from "@/services/chat";

const MY_ID = 4; // id del admin logueado

const conv = (over: Partial<Conversacion>): Conversacion => ({
  id: "c1",
  nombre: "María Gómez",
  contexto: "Solicitud de Luna",
  asunto: "Solicitud de adopción de Luna",
  canal: "usuario",
  noLeidos: 0,
  lastMessageAt: "2026-05-30T10:30:00Z",
  perfil: { email: "maria@email.com", telefono: "11 2233-4455", mascota: "Luna" },
  ...over,
});

const CONVS: Conversacion[] = [
  conv({}),
  conv({ id: "c2", nombre: "Juan Pérez", contexto: "Seguimiento de Toby", noLeidos: 2 }),
  conv({ id: "c3", nombre: "Equipo Veterinario", contexto: "Caso de Nina", canal: "interno", noLeidos: 1 }),
];

const MSGS: Record<string, Mensaje[]> = {
  // senderUserId null => contraparte (otro); === MY_ID => propio
  c1: [{ id: "m1", senderUserId: null, senderName: "María Gómez", texto: "Hola! Sobre Luna...", createdAt: "2026-05-30T10:15:00Z" }],
};

function makeFakeTransport() {
  let listener: ((e: ChatEvent) => void) | undefined;
  const transport: ChatTransport = {
    subscribe: (l) => {
      listener = l;
      return () => (listener = undefined);
    },
    send: jest.fn(),
    close: jest.fn(),
  };
  return { transport, emit: (e: ChatEvent) => listener?.(e) };
}

const renderSection = (transport: ChatTransport) =>
  renderWithStore(<MensajesSection transport={transport} />, {
    preloadedState: { user: makeUser({ id: MY_ID }) },
  });

beforeEach(() => {
  (getConversations as jest.Mock).mockResolvedValue({ ok: true, data: CONVS, status: 200 });
  (getMessages as jest.Mock).mockImplementation((id: string) =>
    Promise.resolve({ ok: true, data: MSGS[id] ?? [], status: 200 }),
  );
  (markConversationRead as jest.Mock).mockResolvedValue({ ok: true, data: { ok: true }, status: 200 });
});

afterEach(() => jest.clearAllMocks());

describe("MensajesSection", () => {
  it("carga las conversaciones del backend y abre la primera", async () => {
    const { transport } = makeFakeTransport();
    renderSection(transport);

    expect(await screen.findByRole("heading", { name: "María Gómez" })).toBeInTheDocument();
    expect(screen.getByText("Solicitud de adopción de Luna")).toBeInTheDocument();
    expect(await screen.findByText("Hola! Sobre Luna...")).toBeInTheDocument();
  });

  it("filtra por canal con la tab 'Internos'", async () => {
    const { transport } = makeFakeTransport();
    renderSection(transport);
    await screen.findByRole("heading", { name: "María Gómez" });

    await userEvent.click(screen.getByRole("tab", { name: "Internos" }));
    expect(screen.getByRole("button", { name: /Equipo Veterinario/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Juan Pérez/ })).not.toBeInTheDocument();
  });

  it("envía por el transporte y muestra el mensaje propio cuando llega el eco", async () => {
    const { transport, emit } = makeFakeTransport();
    renderSection(transport);
    await screen.findByText("Hola! Sobre Luna...");

    const input = screen.getByRole("textbox", { name: "Escribí un mensaje" });
    await userEvent.type(input, "Coordinamos mañana 16hs");
    await userEvent.click(screen.getByRole("button", { name: "Enviar mensaje" }));

    expect(transport.send).toHaveBeenCalledWith("c1", "Coordinamos mañana 16hs");
    expect(input).toHaveValue("");

    // El eco trae senderUserId === MY_ID → se renderiza como mensaje propio.
    emit({
      type: "message",
      conversationId: "c1",
      message: { id: "m2", senderUserId: MY_ID, senderName: "Refugio", texto: "Coordinamos mañana 16hs", createdAt: "2026-05-30T10:40:00Z" },
    });
    expect(await screen.findByText("Coordinamos mañana 16hs")).toBeInTheDocument();
  });

  it("incrementa los no leídos cuando llega un mensaje de otro a otra conversación", async () => {
    const { transport, emit } = makeFakeTransport();
    renderSection(transport);
    await screen.findByRole("heading", { name: "María Gómez" });

    const juan = screen.getByRole("button", { name: /Juan Pérez/ });
    expect(within(juan).getByText("2")).toBeInTheDocument();

    emit({
      type: "message",
      conversationId: "c2",
      message: { id: "x", senderUserId: null, senderName: "Juan Pérez", texto: "Nuevo!", createdAt: "2026-05-30T11:00:00Z" },
    });

    await waitFor(() => expect(within(juan).getByText("3")).toBeInTheDocument());
  });

  it("muestra el perfil de la conversación", async () => {
    const { transport } = makeFakeTransport();
    renderSection(transport);
    await screen.findByRole("heading", { name: "María Gómez" });

    await userEvent.click(screen.getByRole("tab", { name: "Perfil" }));
    expect(screen.getByText("maria@email.com")).toBeInTheDocument();
    expect(screen.getByText("Luna")).toBeInTheDocument();
  });
});
