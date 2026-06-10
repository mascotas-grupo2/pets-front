import axiosInstance from "./axios";
import { request } from "./request";

const axios = axiosInstance;

/** Valor de catálogo (tipo o estado) tal como lo devuelve el backend. */
export type FollowupCatalogValue = {
  id: number;
  code: string;
  label: string;
};

/** Item de seguimiento crudo desde `GET /api/followups`. */
export type FollowupItem = {
  id: number;
  petId: string;
  userId: number;
  typeId: number;
  statusId: number;
  appointmentAt: string;
  createdAt: string;
  type: FollowupCatalogValue | null;
  status: FollowupCatalogValue | null;
};

export type FollowupsResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: FollowupItem[];
};

export type FollowupsParams = {
  petId?: string;
  userId?: number;
  typeId?: number;
  statusId?: number;
  page?: number;
  pageSize?: number;
};

export const getFollowups = (params?: FollowupsParams) =>
  request<FollowupsResponse>(() => axios.get("followups", { params }));

export type CreateFollowupInput = {
  petId: string;
  userId: number;
  typeId: number;
  appointmentAt: string;
};

export const createFollowup = (input: CreateFollowupInput) =>
  request<FollowupItem>(() => axios.post("followups", input));

/** Cambia el estado de un seguimiento (Admin). */
export const changeFollowupStatus = (id: number, statusId: number) =>
  request<FollowupItem>(() => axios.post(`followups/${id}/status`, { statusId }));
