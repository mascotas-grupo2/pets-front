import { ErrorGeneric } from "@/components/utils/catchErrors";
import { User } from "@/types/user";
import axiosInstance from "./axios"; // Assuming this is configured to send cookies

const axios = axiosInstance;

type ResponseAxios = {
  ok: boolean;
  data: User | null;
  status: number;
};
export const login: (
  email: string,
  password: string,
) => Promise<ResponseAxios | undefined> = async (
  email: string,
  password: string,
) => {
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
