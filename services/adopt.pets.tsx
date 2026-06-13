import { AdoptForm } from "@/types/adoptar";
import axiosInstance from "./axios";
import { request } from "./request";
import { User } from "@/types/user";

const axios = axiosInstance;

export const submitAdoption = (values: AdoptForm) =>
  request<User>(() =>
    axios.post("pet/adoptar", values, {
      headers: { "Content-Type": "application/json" },
    }),
  );
