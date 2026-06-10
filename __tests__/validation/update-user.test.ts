import { validationSchemaUpdateUserDetails } from "@/validation/update-user";

describe("validationSchemaUpdateUserDetails", () => {
  it("para no-adoptante solo exige firstName", async () => {
    const schema = validationSchemaUpdateUserDetails(false);
    await expect(schema.validate({ firstName: "Ana" })).resolves.toBeTruthy();
    await expect(schema.validate({})).rejects.toThrow("El nombre es obligatorio");
  });

  it("para adoptante exige los campos extra", async () => {
    const schema = validationSchemaUpdateUserDetails(true);
    // Un formulario solo con firstName no es válido para adoptante.
    await expect(schema.validate({ firstName: "Ana" })).rejects.toThrow();
    // En particular, falta el apellido.
    await expect(
      schema.validateAt("lastName", { firstName: "Ana" }),
    ).rejects.toThrow("El apellido es obligatorio");
  });

  it("para adoptante acepta un formulario completo", async () => {
    const schema = validationSchemaUpdateUserDetails(true);
    await expect(
      schema.validate({
        firstName: "Ana",
        lastName: "Pérez",
        phone: "1122334455",
        addressLine1: "Calle 1",
        addressLine2: "Depto 2",
        postcode: "1000",
        town: "CABA",
        livingSituation: "casa",
        householdSetting: "urbano",
        activityLevel: "alto",
        adults: 2,
        children: 0,
        allergies: "ninguna",
        hasGarden: true,
        visitingChildren: false,
        hasFlatmates: false,
        otherAnimals: false,
        neutered: true,
        vaccinated: true,
      }),
    ).resolves.toBeTruthy();
  });

  it("para adoptante rechaza adults menor a 1", async () => {
    const schema = validationSchemaUpdateUserDetails(true);
    await expect(
      schema.validateAt("adults", { adults: 0 }),
    ).rejects.toThrow("Mínimo 1");
  });
});
