import { PetComment } from "@/types/pet-comment";
import axiosInstance from "./axios";
import { request } from "./request";

const axios = axiosInstance;

/** Comentarios aprobados de una mascota (visible para todos). */
export const getApprovedComments = (petId: string) =>
  request<PetComment[]>(() => axios.get(`mascotas/${petId}/comments`));

/** Comentarios pendientes + aprobados para el dueño/admin. */
export const getOwnerComments = (petId: string) =>
  request<PetComment[]>(() => axios.get(`mascotas/${petId}/comments/admin`));

/** Crear comentario (queda pendiente hasta que el dueño lo apruebe). */
export const createComment = (
  petId: string,
  data: { authorName: string; text: string; authorEmail?: string },
) => request<PetComment>(() => axios.post(`mascotas/${petId}/comments`, data));

/** El dueño aprueba un comentario. */
export const approveComment = (petId: string, commentId: string) =>
  request<PetComment>(() =>
    axios.post(`mascotas/${petId}/comments/${commentId}/approve`),
  );

/** El dueño rechaza un comentario. */
export const rejectComment = (petId: string, commentId: string) =>
  request<PetComment>(() =>
    axios.post(`mascotas/${petId}/comments/${commentId}/reject`),
  );
