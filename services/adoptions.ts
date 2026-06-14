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
  kind: string;
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
  q?: string;
}) =>
  request<AdminAdoptionsResponse>(() =>
    axios.get("adoptions/admin/paged", { params }),
  );

// typed to AdoptionDetail
export const getAdoptionById = (id: number | string) =>
  request<AdoptionDetail>(() => axios.get(`adoptions/${id}`));

/** Compatibilidad usuario↔mascota para el detalle público (usa perfil/solicitud). */
export type PetCompatibility = {
  score: number | null;
  factors: { label: string; isPositive: boolean }[];
  source: "application" | "profile" | "none";
  adoptionId: number | null;
};
export const getPetCompatibility = (petId: string) =>
  request<PetCompatibility>(() => axios.get(`mascotas/${petId}/compatibility`));

/** Solicitudes del usuario logueado (el back filtra por su userId). */
export type MyAdoption = {
  id: number;
  petId: string | null;
  statusId: number;
  status: string;
  kind: string;
  compatibilityScore: number | null;
  createdAt: string;
  updatedAt: string;
  petName: string | null;
  petPhoto: string | null;
  petAnimalTypeId: number | null;
  rejectionReason: string | null;
};
export const getMyAdoptions = () =>
  request<MyAdoption[]>(() => axios.get("adoptions"));

/** Cancela (retira) una solicitud propia → pasa a DESCARTADA. */
export const cancelMyAdoption = (id: number | string) =>
  request<unknown>(() => axios.patch(`adoptions/${id}/cancel`));

/** Elimina una solicitud (solo admin). */
export const deleteAdoption = (id: number | string) =>
  request<void>(() => axios.delete(`adoptions/${id}`));

/** Actualiza el estado de una solicitud (solo admin). `reason` se usa al DESCARTAR. */
export const updateAdoptionStatus = (
  id: number | string,
  status: string,
  reason?: string,
) =>
  request<AdoptionDetail>(() =>
    axios.patch(`adoptions/${id}/status`, { status, reason }),
  );

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
