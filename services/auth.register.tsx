import { ErrorGeneric } from "@/components/utils/catchErrors";
import axiosInstance from "./axios";
import { User } from "@/types/user"; // Ensure this type is correct

const axios = axiosInstance;
type ResponseAxios = {
  ok: boolean;
  data: User | null;
  status: number;
};
export const register: (
  name: string,
  email: string,
  password: string,
) => Promise<ResponseAxios | undefined> = async (
  name: string,
  email: string,
  password: string,
) => {
  try {
    const response = await axios.post("auth/register", {
      name,
      email,
      password,
    });
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    ErrorGeneric(error);
    // Devolvemos el status para que el form pueda distinguir 409 (email ya usado).
    return {
      ok: false,
      data: null,
      status:
        (error as { response?: { status: number } }).response?.status || 500,
    };
  }
};

export const confirmEmailVerification = async (
  token: string,
): Promise<ResponseAxios | undefined> => {
  try {
    const response = await axios.post(`/auth/verify-email`, { token });
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    ErrorGeneric(error);
    return undefined;
  }
};
