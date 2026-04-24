import { ErrorGeneric } from "@/components/utils/catchErrors";
import { AdoptForm } from "@/types/adoptar";
import axiosInstance from "./axios";

const axios = axiosInstance;

export const submitAdoption = async (values: AdoptForm) => {
  try {
    const response = await axios.post("pet/adoptar", values);
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    ErrorGeneric(error);
  }
};
