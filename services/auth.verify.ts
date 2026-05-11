import axios from "axios";
import { User } from "@/types/user";

export const verifyUserSignature = async (user: User) => {
  try {
    const response = await axios.post("/api/auth/verify", user);
    return {
      ok: response.status === 200,
      valid: response.data.valid,
    };
  } catch (error) {
    return { ok: false, valid: false };
  }
};
