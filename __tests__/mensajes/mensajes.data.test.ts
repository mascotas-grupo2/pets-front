import { initials } from "@/components/messages/messages.data";

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
