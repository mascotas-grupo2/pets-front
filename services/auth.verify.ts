import axios from "axios";
import { User } from "@/types/user";

export const verifyUserSignature = async (user: User) => {
  try {
    const response = await axios.post("/api/auth/verify", user);
    return {
      ok: response.status === 200,
      valid: response.data.valid,
    };
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    // 401 = firma realmente inválida → invalidar sesión
    if (status === 401) return { ok: false, valid: false };
    // 5xx / network → endpoint roto (Turbopack panic en dev, etc.). No desloguear.
    console.warn(
      "[verifyUserSignature] error transitorio, mantengo sesión:",
      status,
    );
    return { ok: true, valid: true };
  }
};
