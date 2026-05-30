import { formatEdad } from "@/components/admin/lib/pet-format";

describe("formatEdad", () => {
  it("devuelve '—' sin dato o con valores no positivos", () => {
    expect(formatEdad(undefined)).toBe("—");
    expect(formatEdad(0)).toBe("—");
    expect(formatEdad(-3)).toBe("—");
  });

  it("usa 'mes' en singular y 'meses' en plural (< 12)", () => {
    expect(formatEdad(1)).toBe("1 mes");
    expect(formatEdad(5)).toBe("5 meses");
    expect(formatEdad(11)).toBe("11 meses");
  });

  it("convierte a años a partir de 12 meses", () => {
    expect(formatEdad(12)).toBe("1 año");
    expect(formatEdad(24)).toBe("2 años");
    expect(formatEdad(30)).toBe("2 años"); // floor
  });
});
