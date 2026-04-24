import { ErrorGeneric } from "@/components/utils/catchErrors";
import { User } from "@/types/login";
import axiosInstance from "./axios";

const axios = axiosInstance;

export const login: (
  email: string,
  password: string,
) => Promise<User | undefined> = async (email: string, password: string) => {
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
