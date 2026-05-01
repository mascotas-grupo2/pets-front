import { ErrorGeneric } from "@/components/utils/catchErrors";
import axiosInstance from "./axios";
import { User } from "@/types/user"; // Ensure this type is correct

const axios = axiosInstance;
type ResponseAxios = {
  ok: boolean;
  data: User;
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
  }
};
