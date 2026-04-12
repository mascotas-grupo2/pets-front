import axiosInstance from "../axios";

const axios = axiosInstance;

export const login = async (email: string, password: string) => {
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
