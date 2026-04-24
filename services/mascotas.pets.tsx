import { AxiosError } from "axios";
import { Pet } from "@/types/pet";
import axiosInstance from "./axios";

const axios = axiosInstance;
type ResponseAxiosGetAll = {
  ok: boolean;
  data: Pet[] | null;
  status: number;
};
export const getAllPets: () => Promise<ResponseAxiosGetAll> = async () => {
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
type ResponseAxiosGetId = {
  ok: boolean;
  data: Pet | null;
  status: number;
  error?: string;
};
export const getIdPets: (id: string) => Promise<ResponseAxiosGetId> = async (
  id: string,
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
