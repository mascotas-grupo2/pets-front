import { ErrorGeneric } from "@/components/utils/catchErrors";
import axiosInstance from "./axios";

const axios = axiosInstance;

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post("auth/login", {
      email,
      password,
    });
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    ErrorGeneric(error);
  }
};
