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

export type AdminUsersResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: AdminUser[];
};

export const getAdminUsers = (params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) =>
  request<AdminUsersResponse>(() => axios.get("user/admin/list", { params }));
