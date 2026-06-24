import axiosInstance from "./axios";
import { request } from "./request";

const axios = axiosInstance;

export type Refugio = {
  id: number;
  name: string;
  slug: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  active: boolean;
  createdAt?: string;
};

export type RefugioInput = {
  name: string;
  slug?: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  active?: boolean;
};

export const getRefugios = () => request<Refugio[]>(() => axios.get("refugios"));

export const getPublicRefugios = () =>
  request<Pick<Refugio, "id" | "name" | "slug">[]>(() =>
    axios.get("refugios/public"),
  );

export const createRefugio = (body: RefugioInput) =>
  request<Refugio>(() => axios.post("refugios", body));

export const updateRefugio = (id: number, body: Partial<RefugioInput>) =>
  request<Refugio>(() => axios.put(`refugios/${id}`, body));
