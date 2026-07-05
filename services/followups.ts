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
  /** Responsable del seguimiento (admin/staff). */
  userId: number;
  /** Adoptante / persona interesada (solo seguimientos post-adopción). */
  adopterUserId?: number | null;
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

/** Seguimiento post-adopción visto por el adoptante (incluye datos de la mascota). */
export type MyFollowupItem = FollowupItem & {
  petName: string | null;
  petPhoto: string | null;
};

export type MyFollowupsResponse = { items: MyFollowupItem[] };

/** Seguimientos post-adopción del usuario autenticado (como adoptante). */
export const getMyFollowups = () =>
  request<MyFollowupsResponse>(() => axios.get("followups/mine"));

export type CreateFollowupInput = {
  petId: string;
  userId: number;
  typeId: number;
  appointmentAt: string;
};

export const createFollowup = (input: CreateFollowupInput) =>
  request<FollowupItem>(() => axios.post("followups", input));

/** Confirma un seguimiento (Admin). */
export const confirmFollowup = (id: number) =>
  request<FollowupItem>(() => axios.post(`followups/${id}/confirmar`));

/** Completa un seguimiento (Admin). */
export const completeFollowup = (id: number) =>
  request<FollowupItem>(() => axios.post(`followups/${id}/completar`));

/** Elimina un seguimiento (Admin). */
export const deleteFollowup = (id: number) =>
  request<null>(() => axios.delete(`followups/${id}`));
