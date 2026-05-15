import crypto from "crypto";
export function signUserData(userData: { name: string; role: string; adopter: boolean }) {
  const secret = process.env.APP_SIGNATURE_SECRET || "default-secret-key-123";
  const dataToSign = `${userData.name}|${userData.role}|${!!userData.adopter}`;
  return crypto.createHmac("sha256", secret).update(dataToSign).digest("hex");
}
