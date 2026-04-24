import { ErrorGeneric } from "@/components/utils/catchErrors";
import axiosInstance from "./axios";
import { Pet } from "@/types/pet";

const axios = axiosInstance;
type ResponseAxiosGetAll = {
  ok: boolean;
  data: object | null;
  status: number;
};
export const reportPet: (
  values: Pet,
) => Promise<ResponseAxiosGetAll | undefined> = async (values: Pet) => {
  try {
    const submit = {
      ...values,
      photo: values.photo || null,
    };
    const response = await axios.post("pet/reportar", submit);
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    ErrorGeneric(error);
  }
};
