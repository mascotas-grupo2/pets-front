import {
  reportContactSchema,
  reportDataSchema,
  reportPhotoSchema,
  reportValidationSchema,
} from "@/validation/reportar";

describe("reportDataSchema", () => {
  it("exige descripción de al menos 10 caracteres", async () => {
    await expect(
      reportDataSchema.validate({ animalType: "perro", description: "corta", date: "2026-01-01" }),
    ).rejects.toThrow("Mínimo 10 caracteres");
  });

  it("acepta datos válidos", async () => {
    await expect(
      reportDataSchema.validate({
        animalType: "gato",
        description: "Gato atigrado visto cerca de la plaza",
        date: "2026-01-01",
      }),
    ).resolves.toBeTruthy();
  });
});

describe("reportPhotoSchema", () => {
  it("requiere al menos una foto", async () => {
    await expect(reportPhotoSchema.validate({ photos: [] })).rejects.toThrow(
      "Se requiere al menos una foto",
    );
  });

  it("acepta una foto con nombre y archivo", async () => {
    await expect(
      reportPhotoSchema.validate({ photos: [{ name: "foto.png", file: new Blob() }] }),
    ).resolves.toBeTruthy();
  });
});

describe("reportContactSchema", () => {
  it("rechaza teléfono con letras", async () => {
    await expect(
      reportContactSchema.validate({ contactPhone: "abc", contactEmail: "a@b.com" }),
    ).rejects.toThrow("Teléfono inválido");
  });

  it("acepta teléfono con dígitos y símbolos válidos", async () => {
    await expect(
      reportContactSchema.validate({
        contactPhone: "+54 (11) 1234-5678",
        contactEmail: "a@b.com",
      }),
    ).resolves.toBeTruthy();
  });
});

describe("reportValidationSchema (combinado)", () => {
  it("valida un reporte completo", async () => {
    await expect(
      reportValidationSchema.validate({
        animalType: "perro",
        description: "Perro mediano marrón con collar rojo",
        date: "2026-01-01",
        photos: [{ name: "a.png", file: new Blob() }],
        location: "Av. Siempreviva 742",
        contactPhone: "1122334455",
        contactEmail: "dueno@example.com",
      }),
    ).resolves.toBeTruthy();
  });
});
