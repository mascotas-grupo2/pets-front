import { ErrorGeneric } from "@/components/utils/catchErrors";
import axiosInstance from "./axios";
import { Pet } from "@/types/pet";
import { UserDetails } from "../types/user-details";
import { User } from "@/types/user";

const axios = axiosInstance;
type ResponseAxios = {
  ok: boolean;
  data: User;
  status: number;
};
export const getUser: () => Promise<ResponseAxios | undefined> = async () => {
  try {
    const response = await axios.get(`user/commonInfo`);
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    ErrorGeneric(error);
  }
};

type ResponseAxiosDetailUser = {
  ok: boolean;
  data: UserDetails;
  status: number;
};
export const getUserDetails: () => Promise<
  ResponseAxiosDetailUser | undefined
> = async () => {
  try {
    const response = await axios.get(`user/detailsUser`);
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    ErrorGeneric(error);
  }
};

type ResponseAxiosPets = {
  ok: boolean;
  data: Pet[] | null;
  status: number;
};
export const getUserPets: () => Promise<
  ResponseAxiosPets | undefined
> = async () => {
  try {
    const response = await axios.get(`pets/userPetsById`);
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    ErrorGeneric(error);
  }
};

type ResponseAxiosDetailUserUpdate = {
  ok: boolean;
  data: UserDetails;
  status: number;
};
export const putUserDetails: (
  data: UserDetails,
) => Promise<ResponseAxiosDetailUserUpdate | undefined> = async (
  data: UserDetails,
) => {
  try {
    const response = await axios.put(`user/update`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    ErrorGeneric(error);
  }
};

type ResponseAxiosUpload = { ok: boolean; data: { photo: string }; status: number };
export const uploadUserPhoto: (file: File) => Promise<ResponseAxiosUpload | undefined> = async (file: File) => {
  try {
    const form = new FormData();
    form.append("photo", file);
    const response = await axios.post(`user/photo`, form, {
      headers: {
        // Let browser set the correct multipart boundary
        "Content-Type": "multipart/form-data",
      },
    });
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    ErrorGeneric(error);
  }
};
