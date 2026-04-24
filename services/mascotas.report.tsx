import { ReportForm } from "@/types/reportar";
import axiosInstance from "./axios";
import { ErrorGeneric } from "@/components/utils/catchErrors";

const axios = axiosInstance;

export const reportPet = async (values: ReportForm) => {
  try {
    const submit = {
      ...values,
      photo: values.photo?.file || null,
    };
    const response = await axios.post("pet/reportar", submit);
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    ErrorGeneric(error);
  }
};
