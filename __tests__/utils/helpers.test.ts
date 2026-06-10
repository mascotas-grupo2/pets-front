import { convertLocalMonthYear } from "@/components/utils/helpers";

describe("convertLocalMonthYear", () => {
  it("formatea una fecha ISO como 'mes año' en español, minúsculas", () => {
    // Usamos mediodía UTC para evitar corrimientos por zona horaria.
    expect(convertLocalMonthYear("2026-01-15T12:00:00Z")).toBe("enero 2026");
    expect(convertLocalMonthYear("2025-12-15T12:00:00Z")).toBe("diciembre 2025");
  });

  it("incluye el año correcto", () => {
    expect(convertLocalMonthYear("2024-06-15T12:00:00Z")).toContain("2024");
  });
});
