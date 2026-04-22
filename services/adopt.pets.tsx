import { AdoptForm } from "@/types/adoptar";
import axiosInstance from "./axios";

const axios = axiosInstance;

export const submitAdoption = async (values: AdoptForm) => {
  try {
    const response = await axios.post("pet/adoptar", values);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
