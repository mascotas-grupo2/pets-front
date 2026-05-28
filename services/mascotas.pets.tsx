import { AxiosError } from "axios";
import { AdminPetSummary, Pet, PetNote, PetNoteKind } from "@/types/pet";
import axiosInstance from "./axios";

const axios = axiosInstance;
type ResponseAxiosGetAll = {
  ok: boolean;
  data: Pet[] | null;
  status: number;
};
export const getAllPets: () => Promise<ResponseAxiosGetAll> = async () => {
  try {
    const response = await axios.get(`mascotas/`);
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
type ResponseAxiosGetId = {
  ok: boolean;
  data: Pet | null;
  status: number;
};
export const getIdPets: (id: string) => Promise<ResponseAxiosGetId> = async (
  id: string,
) => {
  try {
    const response = await axios.get(`mascotas/${id}`);
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

type ResponseAxiosGetIds = {
  ok: boolean;
  data: Pet[] | null;
  status: number;
};
export const getIdsPets: (
  ids: string[],
) => Promise<ResponseAxiosGetIds> = async (ids: string[]) => {
  try {
    const response = await axios.post(`mascotas/petsByIds`, { ids });
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

type ResponseAxiosUpdate = {
  ok: boolean;
  data: Pet | null;
  status: number;
  error?: string;
};
export const updatePet: (
  id: string,
  patch: Partial<Pet>,
) => Promise<ResponseAxiosUpdate> = async (id, patch) => {
  try {
    const response = await axios.put(`mascotas/${id}`, patch);
    return { ok: true, data: response.data, status: response.status };
  } catch (error) {
    console.error(error);
    const err = error as AxiosError<{ error?: unknown }>;
    return {
      ok: false,
      data: null,
      status: err.response?.status || 500,
      error: err.message,
    };
  }
};

type ResponseAxiosNotes = {
  ok: boolean;
  data: PetNote[] | null;
  status: number;
  error?: string;
};
export const listPetNotes: (
  id: string,
) => Promise<ResponseAxiosNotes> = async (id) => {
  try {
    const response = await axios.get(`mascotas/${id}/notes`);
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

type ResponseAxiosCreateNote = {
  ok: boolean;
  data: PetNote | null;
  status: number;
  error?: string;
};
export const createPetNote: (
  id: string,
  text: string,
  kind?: PetNoteKind,
) => Promise<ResponseAxiosCreateNote> = async (id, text, kind) => {
  try {
    const response = await axios.post(`mascotas/${id}/notes`, { text, kind });
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

type ResponseAxiosApprove = {
  ok: boolean;
  data: Pet | null;
  status: number;
  error?: string;
};
/** Aprueba una publicación pendiente: el back la pasa a reportStatus = activo. */
export const approvePet: (id: string) => Promise<ResponseAxiosApprove> = async (
  id,
) => {
  try {
    const response = await axios.post(`mascotas/${id}/approve`);
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

/** Rechaza una publicación pendiente: el back la pasa a reportStatus = rechazado. */
export const rejectPet: (id: string) => Promise<ResponseAxiosApprove> = async (
  id,
) => {
  try {
    const response = await axios.post(`mascotas/${id}/reject`);
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

/** Finaliza una publicación: el back la pasa a reportStatus = finalizado. */
export const finalizePet: (id: string) => Promise<ResponseAxiosApprove> = async (
  id,
) => {
  try {
    const response = await axios.post(`mascotas/${id}/finalize`);
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

type ResponseAxiosDelete = { ok: boolean; status: number; error?: string };
/** Elimina una publicación (solo admin). */
export const deletePet: (id: string) => Promise<ResponseAxiosDelete> = async (
  id,
) => {
  try {
    const response = await axios.delete(`mascotas/${id}`);
    return { ok: true, status: response.status };
  } catch (error) {
    console.error(error);
    const err = error as AxiosError;
    return { ok: false, status: err.response?.status || 500, error: err.message };
  }
};

type ResponseAxiosAdminList = {
  ok: boolean;
  data: AdminPetSummary[] | null;
  status: number;
  error?: string;
};
export const getAdminPets: () => Promise<ResponseAxiosAdminList> = async () => {
  try {
    const response = await axios.get(`mascotas/admin/list`);
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
