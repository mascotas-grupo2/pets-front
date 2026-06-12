import {
  transicionesMascotaPermitidas,
  transicionMascotaValida,
  esEstadoMascotaTerminal,
} from "@/components/admin/lib/pet-status";

describe("máquina de estados incremental de la mascota", () => {
  it("desde 'encontrado' (En refugio) NO permite volver a 'perdido'", () => {
    const next = transicionesMascotaPermitidas("encontrado");
    expect(next).not.toContain("perdido");
    expect(next).toContain("en adopción");
    expect(transicionMascotaValida("encontrado", "perdido")).toBe(false);
  });

  it("'perdido' solo avanza a 'encontrado'", () => {
    expect(transicionesMascotaPermitidas("perdido")).toEqual(["encontrado"]);
    expect(transicionMascotaValida("perdido", "encontrado")).toBe(true);
    expect(transicionMascotaValida("perdido", "en adopción")).toBe(false);
  });

  it("'en adopción' solo avanza a 'adoptado'", () => {
    expect(transicionesMascotaPermitidas("en adopción")).toEqual(["adoptado"]);
  });

  it("'adoptado' es terminal", () => {
    expect(esEstadoMascotaTerminal("adoptado")).toBe(true);
    expect(transicionesMascotaPermitidas("adoptado")).toEqual([]);
  });

  it("los estados de cuidado (tránsito/médico) se intercambian pero no retroceden", () => {
    expect(transicionMascotaValida("en tránsito", "en tratamiento médico")).toBe(true);
    expect(transicionMascotaValida("en tránsito", "perdido")).toBe(false);
    expect(transicionMascotaValida("en tratamiento médico", "encontrado")).toBe(false);
  });
});
