import axiosInstance from "./axios";
import { requestSafe } from "./request";

const axios = axiosInstance;

export interface AdminAdoptionsResponse {
  page: number;
  pageSize: number;
  total: number;
  statusTotals: Record<string, number>;
  items: any[];
}

export const getAdminAdoptions = (params?: {
  page?: number;
  pageSize?: number;
  statusId?: number;
  sort?: string;
  q?: string;
}) => {
  return requestSafe<AdminAdoptionsResponse>(() =>
    axios.get("adoptions/admin/paged", { params }),
  );
};

export const getAdoptionDetail = (id: string) => {
  return requestSafe<any>(() => axios.get(`adoptions/${id}`));
};
