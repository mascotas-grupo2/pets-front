import { Pet } from "@/types/pet";
import axiosInstance from "./axios";

const axios = axiosInstance;

export const getAllPets: () => Promise<Pet[] | null> = async () => {
  try {
    const response = await axios.get(`mascotas`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getIdPets: (id: number) => Promise<Pet | null> = async (id: number) => {
  try {
    const response = await axios.get(`mascotas/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
