import {
  transicionesMascotaPermitidas,
  transicionMascotaValida,
  esEstadoMascotaTerminal,
} from "@/components/admin/lib/pet-status";

describe("máquina de estados incremental de la mascota", () => {
  it("'perdido' puede entrar al flujo del refugio o devolverse", () => {
    const next = transicionesMascotaPermitidas("perdido");
    expect(next).toContain("en tránsito");
    expect(next).toContain("en tratamiento médico");
    expect(next).toContain("en adopción");
    expect(next).toContain("devuelta al dueño");
    // No se puede saltar directo a 'adoptado'.
    expect(transicionMascotaValida("perdido", "adoptado")).toBe(false);
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
    expect(transicionMascotaValida("en tratamiento médico", "perdido")).toBe(false);
  });
});
