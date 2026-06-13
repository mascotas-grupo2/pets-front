import axiosInstance from "./axios";
import { request } from "./request";

const axios = axiosInstance;

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  roleId: number;
  adopter: boolean;
  emailVerified: boolean;
  ssoProvider: string | null;
  photo: string | null;
  createdAt: string;
};

export type AdminUserTotals = {
  total: number;
  admins: number;
  adopters: number;
  comunes: number;
};

export type AdminUsersResponse = {
  page: number;
  pageSize: number;
  total: number;
  totals: AdminUserTotals;
  items: AdminUser[];
};

export const getAdminUsers = (params?: {
  search?: string;
  roleId?: number;
  adopter?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
}) =>
  request<AdminUsersResponse>(() => axios.get("user/admin/list", { params }));

/** Cambia el rol de un usuario. El back resuelve el código ("admin" | "user"). */
export const updateUserRole = (id: number, role: "admin" | "user") =>
  request<AdminUser>(() => axios.patch(`user/admin/${id}/role`, { role }));

/** Elimina un usuario y todo lo asociado (cascade en el back). Solo admin. */
export const deleteUser = (id: number) =>
  request<void>(() => axios.delete(`user/admin/${id}`));
