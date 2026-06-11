import type { AdoptionDetail } from "@/types/adoption-detail";
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
  updatedAt: string;
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
  sort?: string;
}) =>
  request<AdminAdoptionsResponse>(() =>
    axios.get("adoptions/admin/paged", { params }),
  );

// typed to AdoptionDetail
export const getAdoptionById = (id: number | string) =>
  request<AdoptionDetail>(() => axios.get(`adoptions/${id}`));

/** Elimina una solicitud (solo admin). */
export const deleteAdoption = (id: number | string) =>
  request<void>(() => axios.delete(`adoptions/${id}`));

/** Actualiza el estado de una solicitud (solo admin). */
export const updateAdoptionStatus = (id: number | string, status: string) =>
  request<AdoptionDetail>(() => axios.patch(`adoptions/${id}/status`, { status }));

// ── Evaluación del adoptante (checklist + impresiones) ──────────────────────

export type AdoptionEvaluationNote = {
  id: number;
  text: string;
  author: string | null;
  createdAt: string;
};

export type AdoptionEvaluation = {
  items: string[];
  checked: string[];
  notes: AdoptionEvaluationNote[];
};

export const getAdoptionEvaluation = (id: number) =>
  request<AdoptionEvaluation>(() => axios.get(`adoptions/${id}/evaluation`));

export const toggleAdoptionCheck = (id: number, item: string, done: boolean) =>
  request<{ checked: string[] }>(() =>
    axios.patch(`adoptions/${id}/checks`, { item, done }),
  );

export const addAdoptionNote = (id: number, text: string) =>
  request<AdoptionEvaluationNote>(() =>
    axios.post(`adoptions/${id}/notes`, { text }),
  );
