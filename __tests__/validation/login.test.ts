import { loginValidationSchema } from "@/validation/login";

describe("loginValidationSchema", () => {
  it("acepta credenciales válidas", async () => {
    await expect(
      loginValidationSchema.validate({
        email: "user@example.com",
        password: "Abcdef12",
      }),
    ).resolves.toBeTruthy();
  });

  it("rechaza email sin formato válido", async () => {
    await expect(
      loginValidationSchema.validate({ email: "no-es-email", password: "Abcdef12" }),
    ).rejects.toThrow("Email inválido");
  });

  it("rechaza password sin mayúscula/minúscula/número", async () => {
    await expect(
      loginValidationSchema.validate({ email: "user@example.com", password: "alllowercase" }),
    ).rejects.toThrow("Contraseña inválida");
  });

  it("rechaza password de menos de 8 caracteres", async () => {
    await expect(
      loginValidationSchema.validate({ email: "user@example.com", password: "Ab1" }),
    ).rejects.toThrow();
  });

  it("exige email y password (campos requeridos)", async () => {
    await expect(loginValidationSchema.validate({})).rejects.toThrow("Requerido");
  });
});
