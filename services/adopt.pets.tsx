import { ErrorGeneric } from "@/components/utils/catchErrors";
import { AdoptForm } from "@/types/adoptar";
import axiosInstance from "./axios";
import { User } from "@/types/user";

const axios = axiosInstance;

type ResponseAxios = {
  ok: boolean;
  data: User | null;
  status: number;
};
export const submitAdoption: (
  values: AdoptForm,
) => Promise<ResponseAxios | undefined> = async (values: AdoptForm) => {
  try {
    const response = await axios.post("pet/adoptar", values,
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
