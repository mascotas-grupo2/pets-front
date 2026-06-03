import axiosInstance from "./axios";

const axios = axiosInstance;

export const register = async (name: string, email: string, password: string) => {
  try {
    const response = await axios.post("auth/register", {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
