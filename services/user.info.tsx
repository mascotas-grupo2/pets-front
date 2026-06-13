import axiosInstance from "./axios";
import { request, requestSafe } from "./request";
import { Pet } from "@/types/pet";
import { UserDetails } from "../types/user-details";
import { User } from "@/types/user";

const axios = axiosInstance;

export const getUser = () =>
  requestSafe<User>(() => axios.get(`user/commonInfo`));

export type ContactAdmin = {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  role: string;
};
/** Admins contactables por cualquier usuario (para iniciar chat con el refugio). */
export const getContactableAdmins = () =>
  request<ContactAdmin[]>(() => axios.get(`user/admins`));

export const getUserDetails = () =>
  requestSafe<UserDetails>(() => axios.get(`user/detailsUser`));

export const getUserPets = () =>
  requestSafe<Pet[]>(() => axios.get(`pets/userPetsById`));

export const putUserDetails = (data: UserDetails) =>
  request<UserDetails>(() =>
    axios.put(`user/update`, data, {
      headers: { "Content-Type": "application/json" },
    }),
  );

export const uploadUserPhoto = (file: File) => {
  const form = new FormData();
  form.append("photo", file);
  return request<{ photo: string }>(() =>
    axios.post(`user/photo`, form, {
      // El browser setea el boundary multipart correcto.
      headers: { "Content-Type": "multipart/form-data" },
    }),
  );
};
