import { AdoptForm } from "@/types/adoptar";
import axiosInstance from "./axios";

const axios = axiosInstance;

/**
 * POST al endpoint de adopción. Devuelve `undefined` cuando el backend no
 * está disponible — el caller decide cómo seguir (ej: mostrar la pantalla
 * de confirmación igual).
 */
export const submitAdoption = async (values: AdoptForm) => {
  try {
    const response = await axios.post("pet/adoptar", values);
    return response.data;
  } catch {
    return undefined;
  }
};
