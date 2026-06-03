import { ReportForm } from "@/types/reportar";
import axiosInstance from "./axios";

const axios = axiosInstance;

export const reportPet = async (values: ReportForm) => {
  try {
    const submit = {
      ...values,
      photo: values.photo?.file || null,
    };
    const response = await axios.post("pet/reportar", submit);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
