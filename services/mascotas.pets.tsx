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

/** Rechaza una publicación pendiente: el back la pasa a reportStatus = rechazado. */
export const rejectPet = (id: string) =>
  request<Pet>(() => axios.post(`mascotas/${id}/reject`));

/** Finaliza una publicación: el back la pasa a reportStatus = finalizado. */
export const finalizePet = (id: string) =>
  request<Pet>(() => axios.post(`mascotas/${id}/finalize`));

/** Elimina una publicación (solo admin). */
export const deletePet = (id: string) =>
  request<null>(() => axios.delete(`mascotas/${id}`));

export const getAdminPets = (params?: { sort?: string }) =>
  request<AdminPetSummary[]>(() => axios.get(`mascotas/admin/list`, { params }));
