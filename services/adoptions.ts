import axiosInstance from "./axios";
import { request } from "./request";

const axios = axiosInstance;

export type AdminAdoptionItem = {
  id: number;
  userId: number | null;
  petId: string | null;
  statusId: number;
  status: string;
  compatibilityScore: number | null;
  createdAt: string;
  applicantName: string;
  applicantEmail: string;
  userName: string | null;
  userEmail: string | null;
  userPhoto: string | null;
  petName: string | null;
  petPhoto: string | null;
  petAnimalTypeId: number | null;
};

export type AdminAdoptionsResponse = {
  page: number;
  pageSize: number;
  total: number;
  statusTotals: Record<string, number>;
  items: AdminAdoptionItem[];
};

export const getAdminAdoptions = (params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  userId?: number;
  petId?: string;
}) =>
  request<AdminAdoptionsResponse>(() =>
    axios.get("adoptions/admin/paged", { params }),
  );

export const getAdoptionById = (id: number | string) =>
  request<Record<string, unknown>>(() => axios.get(`adoptions/${id}`));
