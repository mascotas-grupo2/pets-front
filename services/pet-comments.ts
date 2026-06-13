import { PetComment } from "@/types/pet-comment";
import axiosInstance from "./axios";
import { request } from "./request";

const axios = axiosInstance;

/** Obtiene los comentarios aprobados de una mascota (visible para todos). */
export const getApprovedComments = (petId: string) =>
  request<PetComment[]>(() => axios.get(`mascotas/${petId}/comments`));

/** Obtiene los comentarios pendientes + aprobados para el owner (solo dueño). */
export const getOwnerComments = (petId: string) =>
  request<PetComment[]>(() => axios.get(`mascotas/${petId}/comments/admin`));

/** Crear un nuevo comentario (queda pendiente hasta que el owner lo apruebe). */
export const createComment = (
  petId: string,
  data: { authorName: string; text: string; authorEmail?: string },
) =>
  request<PetComment>(() => axios.post(`mascotas/${petId}/comments`, data));

/** El owner aprueba un comentario. */
export const approveComment = (petId: string, commentId: string) =>
  request<PetComment>(() =>
    axios.post(`mascotas/${petId}/comments/${commentId}/approve`),
  );

/** El owner rechaza un comentario. */
export const rejectComment = (petId: string, commentId: string) =>
  request<PetComment>(() =>
    axios.post(`mascotas/${petId}/comments/${commentId}/reject`),
  );
