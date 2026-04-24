import { ErrorGeneric } from "@/components/utils/catchErrors";
import axiosInstance from "./axios";

const axios = axiosInstance;

export const register = async (name: string, email: string, password: string) => {
  try {
    const response = await axios.post("auth/register", {
      name,
      email,
      password,
    });
    return { ok: true, data: response.data, status: response.status };;
  } catch (error) {
    ErrorGeneric(error);
  }
};
