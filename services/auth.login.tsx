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
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
