import {
  adoptFullSchema,
  adoptRoommateSchema,
  adoptStartSchema,
} from "@/validation/adoptar";

describe("adoptStartSchema", () => {
  const valid = {
    firstName: "Ana",
    lastName: "Pérez",
    email: "ana@example.com",
    phone: "1122334455",
    preferredAnimal: "perro",
    acceptsTerms: true,
  };

  it("acepta el primer paso completo", async () => {
    await expect(adoptStartSchema.validate(valid)).resolves.toBeTruthy();
  });

  it("exige aceptar los términos", async () => {
    await expect(
      adoptStartSchema.validateAt("acceptsTerms", { acceptsTerms: false }),
    ).rejects.toThrow("Debés aceptar los términos");
  });

  it("rechaza email inválido", async () => {
    await expect(
      adoptStartSchema.validate({ ...valid, email: "mal" }),
    ).rejects.toThrow("Email inválido");
  });
});

describe("adoptRoommateSchema", () => {
  it("exige al menos un adulto", async () => {
    await expect(
      adoptRoommateSchema.validateAt("adults", { adults: 0 }),
    ).rejects.toThrow("Al menos un adulto debe vivir en el hogar");
  });
});

describe("adoptFullSchema", () => {
  it("devuelve el schema correspondiente a cada paso", () => {
    expect(adoptFullSchema(0)).toBe(adoptStartSchema);
    expect(adoptFullSchema(3)).toBe(adoptRoommateSchema);
  });

  it("el último paso (confirmación) no tiene schema", () => {
    expect(adoptFullSchema(5)).toBeNull();
  });
});
