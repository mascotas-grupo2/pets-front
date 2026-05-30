import { registerValidationSchema } from "@/validation/register";

const valid = {
  name: "Carla",
  email: "carla@example.com",
  password: "Abcdef1!",
  confirmPassword: "Abcdef1!",
};

describe("registerValidationSchema", () => {
  it("acepta un registro válido", async () => {
    await expect(registerValidationSchema.validate(valid)).resolves.toBeTruthy();
  });

  it("rechaza nombre de menos de 2 caracteres", async () => {
    await expect(
      registerValidationSchema.validate({ ...valid, name: "C" }),
    ).rejects.toThrow("Mínimo 2 caracteres");
  });

  it("exige un símbolo en la contraseña", async () => {
    await expect(
      registerValidationSchema.validate({
        ...valid,
        password: "Abcdef12",
        confirmPassword: "Abcdef12",
      }),
    ).rejects.toThrow(/símbolo/);
  });

  it("rechaza cuando las contraseñas no coinciden", async () => {
    await expect(
      registerValidationSchema.validate({ ...valid, confirmPassword: "Otra1!aa" }),
    ).rejects.toThrow("Las contraseñas no coinciden");
  });
});
