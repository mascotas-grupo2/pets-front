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
  userId: number,
  values: Pet,
) => Promise<ResponseAxiosGetAll | undefined> = async (userId: number, values: Pet) => {
  try {
    const submit = {
      ...values,
      userId,
      photo: values.photo || null,
    };
    const response = await axios.post("pet/reportar", JSON.stringify(submit),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    ErrorGeneric(error);
  }
};
