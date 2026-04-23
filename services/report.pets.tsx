import { ReportForm } from "@/types/reportar";
import axiosInstance from "./axios";

const axios = axiosInstance;

/**
 * POST al endpoint de reporte. Devuelve `undefined` cuando el backend no
 * está disponible — el caller decide si persiste localmente igual.
 */
export const reportPet = async (values: ReportForm) => {
  try {
    const submit = {
      ...values,
      photo: values.photo?.file || null,
    };
    const response = await axios.post("pet/reportar", submit);
    return response.data;
  } catch {
    return undefined;
  }
};
