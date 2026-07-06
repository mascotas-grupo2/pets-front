import {
  PET_MEDICAL_CHIP_CLASS,
  PET_MEDICAL_STATUS_OPTIONS,
  PET_NOTE_KIND_LABEL,
  PET_NOTE_KIND_OPTIONS,
  PET_STATUS_CHIP_CLASS,
  PET_STATUS_OPTIONS,
} from "@/lib/admin/pet-status";

describe("catálogos de estado de mascota", () => {
  it("toda opción de estado tiene una clase de chip asociada", () => {
    for (const opt of PET_STATUS_OPTIONS) {
      expect(PET_STATUS_CHIP_CLASS[opt.value]).toBeDefined();
      expect(PET_STATUS_CHIP_CLASS[opt.value]).toContain("admin-chip");
    }
  });

  it("toda opción médica tiene clase de chip asociada", () => {
    for (const opt of PET_MEDICAL_STATUS_OPTIONS) {
      expect(PET_MEDICAL_CHIP_CLASS[opt.value]).toContain("admin-chip");
    }
  });

  it("las opciones de tipo de nota coinciden con sus etiquetas", () => {
    for (const opt of PET_NOTE_KIND_OPTIONS) {
      expect(PET_NOTE_KIND_LABEL[opt.value]).toBe(opt.label);
    }
  });

  it("incluye los 5 estados de publicación esperados", () => {
    expect(PET_STATUS_OPTIONS.map((o) => o.value)).toEqual([
      "perdido",
      "en tránsito",
      "en tratamiento médico",
      "en adopción",
      "adoptado",
    ]);
  });
});
