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
export const getUser: (
  id: string | number,
) => Promise<ResponseAxios | undefined> = async (id) => {
  try {
    const response = await axios.get(`user/commonInfo/${id}`);
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
export const getUserDetails: (
  id: string | number,
) => Promise<ResponseAxiosDetailUser | undefined> = async (id) => {
  try {
    const response = await axios.get(`user/detailsUser?id=${id}`);
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    ErrorGeneric(error);
  }
};

type ResponseAxiosAuthToken = {
  ok: boolean;
  data: User;
  status: number;
};
export const getUserAuthToken: ( 
) => Promise<ResponseAxiosAuthToken | undefined> = async () => {
  try {
    const response = await axios.get(`user/me`);
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
export const getUserPets: (
  id: number,
) => Promise<ResponseAxiosPets | undefined> = async (id: number) => {
  try {
    const response = await axios.get(`pets/userPetsById?id=${id}`);
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
