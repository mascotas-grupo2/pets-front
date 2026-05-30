import { horaCorta, horaMensaje, initials } from "@/components/admin/sections/mensajes/format";

describe("initials", () => {
  it("toma las primeras letras de hasta dos palabras", () => {
    expect(initials("María Gómez")).toBe("MG");
    expect(initials("Equipo Veterinario")).toBe("EV");
  });
  it("funciona con un solo nombre y con vacío", () => {
    expect(initials("Luna")).toBe("L");
    expect(initials("   ")).toBe("?");
  });
});

describe("horaCorta", () => {
  const now = new Date("2026-05-30T12:00:00");

  it("devuelve la hora si es del mismo día", () => {
    expect(horaCorta("2026-05-30T10:30:00", now)).toBe("10:30");
  });
  it("devuelve 'Ayer' si fue el día anterior", () => {
    expect(horaCorta("2026-05-29T18:00:00", now)).toBe("Ayer");
  });
  it("devuelve dd/mm si es más antiguo", () => {
    expect(horaCorta("2026-05-25T09:00:00", now)).toBe("25/05");
  });
  it("devuelve '' si no hay fecha", () => {
    expect(horaCorta(null, now)).toBe("");
  });
});

describe("horaMensaje", () => {
  it("formatea fecha y hora completas", () => {
    expect(horaMensaje("2026-05-23T10:15:00")).toBe("23/05/2026 10:15");
  });
});
