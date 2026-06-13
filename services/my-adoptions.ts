import axiosInstance from "./axios";
import { request } from "./request";

const axios = axiosInstance;

export type MyAdoption = {
  id: number;
  petId: string | null;
  petName: string | null;
  petPhoto: string | null;
  status: string;
  statusLabel: string;
  compatibilityScore: number | null;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
};

/** Obtiene las solicitudes de adopción del usuario actual. */
export const getMyAdoptions = () =>
  request<MyAdoption[]>(() => axios.get("adoptions/my"));
