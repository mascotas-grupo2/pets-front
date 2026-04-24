import { AxiosError } from "axios";
import { Pet } from "@/types/pet";
import axiosInstance from "./axios";

const axios = axiosInstance;

export const getAllPets: () => Promise<Pet[] | undefined> = async () => {
  try {
    const response = await axios.get(`mascotas/`);
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    console.error(error);
    const err = error as AxiosError;
    return {
      ok: false,
      data: null,
      status: err.response?.status || 500,
      error: err.message,
    };
  }
};

export const getIdPets: (id: number) => Promise<Pet | undefined> = async (
  id: number,
) => {
  try {
    const response = await axios.get(`mascotas/${id}`);
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    console.error(error);
    const err = error as AxiosError;
    return {
      ok: false,
      data: null,
      status: err.response?.status || 500,
      error: err.message,
    };
  }
};
