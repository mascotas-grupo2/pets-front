import { signUserData } from "@/lib/auth-signature";
import crypto from "crypto";

describe("signUserData", () => {
  const input = { name: "Ana", role: "user", adopter: true };

  it("es determinista para la misma entrada", () => {
    expect(signUserData(input)).toBe(signUserData(input));
  });

  it("devuelve un HMAC-SHA256 en hex (64 caracteres)", () => {
    const sig = signUserData(input);
    expect(sig).toMatch(/^[a-f0-9]{64}$/);
  });

  it("cambia si cambia algún campo", () => {
    expect(signUserData(input)).not.toBe(signUserData({ ...input, role: "admin" }));
    expect(signUserData(input)).not.toBe(signUserData({ ...input, adopter: false }));
  });

  it("coincide con el cálculo manual usando el secret del entorno", () => {
    const secret = process.env.APP_SIGNATURE_SECRET || "default-secret-key-123";
    const expected = crypto
      .createHmac("sha256", secret)
      .update("Ana|user|true")
      .digest("hex");
    expect(signUserData(input)).toBe(expected);
  });
});
