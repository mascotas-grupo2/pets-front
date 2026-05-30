import { CONVERSACIONES, initials, totalNoLeidos } from "@/components/admin/sections/mensajes/mensajes.data";

describe("initials", () => {
  it("toma las primeras letras de hasta dos palabras", () => {
    expect(initials("María Gómez")).toBe("MG");
    expect(initials("Equipo Veterinario")).toBe("EV");
  });

  it("funciona con un solo nombre", () => {
    expect(initials("Luna")).toBe("L");
  });

  it("devuelve '?' si el nombre está vacío", () => {
    expect(initials("   ")).toBe("?");
  });
});

describe("totalNoLeidos", () => {
  it("suma los no leídos de todas las conversaciones", () => {
    expect(totalNoLeidos(CONVERSACIONES)).toBe(
      CONVERSACIONES.reduce((a, c) => a + c.noLeidos, 0),
    );
  });

  it("es 0 para una lista vacía", () => {
    expect(totalNoLeidos([])).toBe(0);
  });
});
