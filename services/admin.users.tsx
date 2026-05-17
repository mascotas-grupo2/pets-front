import { AxiosError } from "axios";
import axiosInstance from "./axios";

const axios = axiosInstance;

export type AdminUserRole = "admin" | "user";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: AdminUserRole;
  adopter: boolean;
  emailVerified: boolean;
  ssoProvider: string | null;
  photo: string | null;
  createdAt: string;
};

type ListResponse = {
  ok: boolean;
  data: {
    page: number;
    pageSize: number;
    total: number;
    items: AdminUser[];
  } | null;
  status: number;
  error?: string;
};

export type ListAdminUsersParams = {
  search?: string;
  role?: AdminUserRole;
  page?: number;
  pageSize?: number;
};

export const listAdminUsers = async (
  params: ListAdminUsersParams = {},
): Promise<ListResponse> => {
  try {
    const response = await axios.get(`user/admin/list`, { params });
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    console.error(error);
    const err = error as AxiosError;
    return {
      ok: false,
      data: null,
      status: err.response?.status || 500,
      error: err.message,
    };
  }
};

type UpdateResponse = {
  ok: boolean;
  data: AdminUser | null;
  status: number;
  error?: string;
};

export const updateUserRole = async (
  id: number,
  role: AdminUserRole,
): Promise<UpdateResponse> => {
  try {
    const response = await axios.patch(`user/admin/${id}/role`, { role });
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    console.error(error);
    const err = error as AxiosError<{ error?: string }>;
    return {
      ok: false,
      data: null,
      status: err.response?.status || 500,
      error:
        (typeof err.response?.data?.error === "string"
          ? err.response.data.error
          : null) ?? err.message,
    };
  }
};
