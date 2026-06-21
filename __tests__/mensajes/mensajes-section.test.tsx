import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MensajesSection from "@/components/admin/sections/mensajes/mensajes-section";
import {
  getConversation,
  getInbox,
  sendMessage,
} from "@/services/messages.services";

jest.mock("@/services/messages.services", () => ({
  getInbox: jest.fn(),
  getConversation: jest.fn(),
  sendMessage: jest.fn(),
}));

// Estado del usuario logueado; los tests lo mutan para simular logout.
const mockUser = {
  isLoggedIn: true,
  id: 1,
  name: "Admin",
  adopter: false,
  role: "admin",
  signature: "",
};

jest.mock("@/redux/hooks", () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ user: mockUser }),
}));

const INBOX = {
  ok: true,
  data: {
    totalUnread: 2,
    conversations: [
      {
        user: { id: 10, name: "María Gómez", photo: "" },
        latestMessage: {
          id: 1,
          senderId: 10,
          receiverId: 1,
          content: "Me gustaría saber más sobre Luna.",
          read: false,
          createdAt: "2026-06-01T10:00:00Z",
        },
        unread: 2,
      },
      {
        user: { id: 11, name: "Juan Pérez", photo: "" },
        latestMessage: {
          id: 2,
          senderId: 1,
          receiverId: 11,
          content: "Gracias por el update.",
          read: true,
          createdAt: "2026-06-02T18:00:00Z",
        },
        unread: 0,
      },
    ],
  },
};

const CONVERSATION = {
  ok: true,
  data: {
    messages: [
      {
        id: 1,
        senderId: 10,
        receiverId: 1,
        content: "Hola! Quería consultar por la adopción de Luna.",
        read: false,
        createdAt: "2026-06-01T10:00:00Z",
      },
    ],
  },
};

beforeAll(() => {
  // jsdom no implementa scrollIntoView (lo usa el auto-scroll del hilo).
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUser.isLoggedIn = true;
  (getInbox as jest.Mock).mockResolvedValue(INBOX);
  (getConversation as jest.Mock).mockResolvedValue(CONVERSATION);
});

describe("MensajesSection", () => {
  it("muestra las conversaciones de la bandeja", async () => {
    render(<MensajesSection />);
    expect(
      await screen.findByRole("button", { name: /María Gómez/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Juan Pérez/ }),
    ).toBeInTheDocument();
  });

  it("no pide la bandeja si el usuario no está logueado", () => {
    mockUser.isLoggedIn = false;
    render(<MensajesSection />);
    // El hook useInbox gatea por sesión: sin login no se llama al backend.
    expect(getInbox).not.toHaveBeenCalled();
  });

  it("filtra la lista al buscar por nombre", async () => {
    render(<MensajesSection />);
    await screen.findByRole("button", { name: /María Gómez/ });

    await userEvent.type(screen.getByRole("searchbox"), "juan");

    expect(
      screen.getByRole("button", { name: /Juan Pérez/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /María Gómez/ }),
    ).not.toBeInTheDocument();
  });

  it("al abrir una conversación muestra su hilo y limpia los no leídos", async () => {
    render(<MensajesSection />);
    const item = await screen.findByRole("button", { name: /María Gómez/ });
    // Antes de abrir, tiene un badge de no leídos.
    expect(within(item).getByText("2")).toBeInTheDocument();

    await userEvent.click(item);

    expect(getConversation).toHaveBeenCalledWith(10, { limit: 30 });
    expect(
      await screen.findByRole("heading", { name: "María Gómez" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Hola! Quería consultar por la adopción de Luna."),
    ).toBeInTheDocument();
    // El badge desaparece tras abrirla.
    await waitFor(() =>
      expect(within(item).queryByText("2")).not.toBeInTheDocument(),
    );
  });

  it("envía un mensaje y lo agrega al hilo", async () => {
    (sendMessage as jest.Mock).mockResolvedValue({
      ok: true,
      data: {
        id: 99,
        senderId: 1,
        receiverId: 10,
        content: "Coordinamos para mañana 16hs",
        read: false,
        createdAt: "2026-06-03T16:00:00Z",
      },
    });
    render(<MensajesSection />);
    await userEvent.click(
      await screen.findByRole("button", { name: /María Gómez/ }),
    );

    const input = await screen.findByRole("textbox", {
      name: "Escribí un mensaje",
    });
    const enviar = screen.getByRole("button", { name: "Enviar mensaje" });

    expect(enviar).toBeDisabled();
    await userEvent.type(input, "Coordinamos para mañana 16hs");
    expect(enviar).toBeEnabled();
    await userEvent.click(enviar);

    // sendMessage(receiverId, content, photo?) — verificamos los args relevantes
    // sin acoplarnos al 3er parámetro opcional (foto).
    expect((sendMessage as jest.Mock).mock.calls[0][0]).toBe(10);
    expect((sendMessage as jest.Mock).mock.calls[0][1]).toBe(
      "Coordinamos para mañana 16hs",
    );
    expect(
      await screen.findByText("Coordinamos para mañana 16hs"),
    ).toBeInTheDocument();
    expect(input).toHaveValue(""); // se limpia el campo
  });
});
