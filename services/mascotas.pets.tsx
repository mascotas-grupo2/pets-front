import { AdminPetSummary, Pet, PetNote, PetNoteKind } from "@/types/pet";
import axiosInstance from "./axios";
import { request } from "./request";

const axios = axiosInstance;

export const getAllPets = () => request<Pet[]>(() => axios.get(`mascotas/`));

export const getIdPets = (id: string) =>
  request<Pet>(() => axios.get(`mascotas/${id}`));

export const getIdsPets = (ids: string[]) =>
  request<Pet[]>(() => axios.post(`mascotas/petsByIds`, { ids }));

export const updatePet = (id: string, patch: Partial<Pet>) =>
  request<Pet>(() => axios.put(`mascotas/${id}`, patch));

export const listPetNotes = (id: string) =>
  request<PetNote[]>(() => axios.get(`mascotas/${id}/notes`));

export const createPetNote = (id: string, text: string, kind?: PetNoteKind) =>
  request<PetNote>(() => axios.post(`mascotas/${id}/notes`, { text, kind }));

/** Aprueba una publicación pendiente: el back la pasa a reportStatus = activo. */
export const approvePet = (id: string) =>
  request<Pet>(() => axios.post(`mascotas/${id}/approve`));

export const rejectPet = (id: string, reason?: string) =>
  request<Pet>(() =>
    axios.post(`mascotas/${id}/reject`, reason ? { reason } : {}),
  );

/** Finaliza una publicación: el back la pasa a reportStatus = finalizado. */
export const finalizePet = (id: string) =>
  request<Pet>(() => axios.post(`mascotas/${id}/finalize`));

/** Cierre "apareció/reunido": el dueño cierra una mascota perdida que apareció. */
export const resolvePet = (id: string) =>
  request<Pet>(() => axios.post(`mascotas/${id}/resolve`));

/** Reporta un avistamiento ("La vi") — queda registrado y notifica al dueño. */
export const createSighting = (
  id: string,
  data: { place?: string; sightedOn?: string; note?: string; contact?: string },
) => request<unknown>(() => axios.post(`mascotas/${id}/sightings`, data));

/**
 * Reclamo de mascota: un usuario reporta que una mascota podría ser suya.
 */
export const claimPet = (id: string, data: {
  claimantName: string;
  claimantPhone: string;
  claimantEmail?: string;
  description?: string;
}) =>
  request<{ ok: boolean; message: string }>(() =>
    axios.post(`mascotas/${id}/claim`, data),
  );

/**
 * Confirmar devolución: el admin confirma que la mascota fue devuelta a su dueño.
 */
export const confirmReturnPet = (id: string, returnedTo: string) =>
  request<Pet>(() =>
    axios.post(`mascotas/${id}/confirm-return`, { returnedTo }),
  );

/** Elimina una publicación (solo admin). El motivo es opcional. */
export const deletePet = (id: string, reason?: string) =>
  request<null>(() =>
    axios.delete(`mascotas/${id}`, reason ? { data: { reason } } : undefined),
  );

/** Entrega directa: marca la mascota como adoptada registrando a quién se entregó. */
export const entregaDirectaPet = (id: string, recipientName: string) =>
  request<Pet>(() =>
    axios.post(`mascotas/${id}/entrega-directa`, { recipientName }),
  );

export const getAdminPets = (params?: { sort?: string }) =>
  request<AdminPetSummary[]>(() =>
    axios.get(`mascotas/admin/list`, { params }),
  );

export type PetReportStatusTotals = {
  pendiente: number;
  activo: number;
  rechazado: number;
  finalizado: number;
  reservada: number;
};

export type PetStatusTotals = {
  todas: number;
  perdido: number;
  refugio: number;
  adopcion: number;
  adoptados: number;
};

export type AdminPetsPagedResponse = {
  items: AdminPetSummary[];
  total: number;
  page: number;
  pageSize: number;
  statusTotals: PetReportStatusTotals;
  petStatusTotals: PetStatusTotals;
};

/** Listado admin de publicaciones/mascotas paginado, filtrado y ordenado en el back. */
export const getAdminPetsPaged = (params: {
  page?: number;
  pageSize?: number;
  reportStatus?: string;
  /** Categoría de situación para la sección Mascotas: perdido|refugio|adopcion|adoptados */
  statusCategory?: string;
  animalTypeId?: number;
  q?: string;
  sort?: string;
}) =>
  request<AdminPetsPagedResponse>(() =>
    axios.get(`mascotas/admin/paged`, { params }),
  );
