import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MensajesSection } from "@/components/admin/sections/mensajes/mensajes-section";

describe("MensajesSection", () => {
  it("muestra la lista de conversaciones y abre la primera por defecto", () => {
    render(<MensajesSection />);
    // La lista incluye a varios usuarios.
    expect(screen.getByRole("button", { name: /María Gómez/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Juan Pérez/ })).toBeInTheDocument();
    // La conversación activa por defecto muestra su asunto en la cabecera.
    expect(
      screen.getByRole("heading", { name: "María Gómez" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Solicitud de adopción de Luna")).toBeInTheDocument();
  });

  it("filtra por canal con la tab 'Internos'", async () => {
    render(<MensajesSection />);
    await userEvent.click(screen.getByRole("tab", { name: "Internos" }));

    expect(screen.getByRole("button", { name: /Equipo Veterinario/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Juan Pérez/ })).not.toBeInTheDocument();
  });

  it("filtra la lista al buscar por nombre", async () => {
    render(<MensajesSection />);
    await userEvent.type(screen.getByRole("searchbox"), "laura");

    expect(screen.getByRole("button", { name: /Laura Martínez/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Juan Pérez/ })).not.toBeInTheDocument();
  });

  it("al abrir una conversación muestra su hilo y limpia los no leídos", async () => {
    render(<MensajesSection />);
    const item = screen.getByRole("button", { name: /Laura Martínez/ });
    // Antes de abrir, tiene un badge de no leídos.
    expect(within(item).getByText("2")).toBeInTheDocument();

    await userEvent.click(item);

    expect(screen.getByRole("heading", { name: "Laura Martínez" })).toBeInTheDocument();
    expect(
      screen.getByText("¿Necesitan algún documento adicional para la adopción?"),
    ).toBeInTheDocument();
    // El badge desaparece tras abrirla.
    expect(within(item).queryByText("2")).not.toBeInTheDocument();
  });

  it("envía un mensaje y lo agrega al hilo", async () => {
    render(<MensajesSection />);
    const input = screen.getByRole("textbox", { name: "Escribí un mensaje" });
    const enviar = screen.getByRole("button", { name: "Enviar mensaje" });

    expect(enviar).toBeDisabled();
    await userEvent.type(input, "Coordinamos para mañana 16hs");
    expect(enviar).toBeEnabled();
    await userEvent.click(enviar);

    expect(screen.getByText("Coordinamos para mañana 16hs")).toBeInTheDocument();
    expect(input).toHaveValue(""); // se limpia el campo
  });

  it("cambia a la pestaña Perfil y muestra los datos de contacto", async () => {
    render(<MensajesSection />);
    await userEvent.click(screen.getByRole("tab", { name: "Perfil" }));
    expect(screen.getByText("maria@email.com")).toBeInTheDocument();
    expect(screen.getByText("Luna")).toBeInTheDocument();
  });
});
