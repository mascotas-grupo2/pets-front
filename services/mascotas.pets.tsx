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

/**
 * Actualiza las fotos de una publicación.
 * `keep` son las URLs existentes que se conservan; `files` las imágenes nuevas.
 */
export const updatePetPhotos = (
  id: string,
  keep: string[],
  files: File[],
) => {
  const formData = new FormData();
  formData.append("keep", JSON.stringify(keep));
  files.forEach((f) => formData.append("photo", f, f.name));
  return request<Pet>(() => axios.put(`mascotas/${id}/photos`, formData));
};

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

/** Un avistamiento ("La vi") reportado sobre una mascota. */
export type Sighting = {
  id: string;
  petId: string;
  reporterUserId: number | null;
  place: string | null;
  latitud: number | null;
  longitud: number | null;
  sightedOn: string | null;
  note: string | null;
  contact: string | null;
  accepted: boolean;
  acceptedAt: string | null;
  acceptedByUserId: number | null;
  rejected: boolean;
  rejectedAt: string | null;
  rejectedByUserId: number | null;
  createdAt: string;
};

/** Reporta un avistamiento ("La vi") — queda registrado y notifica al dueño y al refugio. */
export const createSighting = (
  id: string,
  data: {
    place?: string;
    sightedOn?: string;
    note?: string;
    contact?: string;
    latitud?: number | null;
    longitud?: number | null;
  },
) => request<unknown>(() => axios.post(`mascotas/${id}/sightings`, data));

/** Lista los avistamientos de una mascota (solo dueño o admin). */
export const listSightings = (id: string) =>
  request<Sighting[]>(() => axios.get(`mascotas/${id}/sightings`));

/** Acepta/confirma un avistamiento (dueño o admin). */
export const acceptSighting = (petId: string, sightingId: string) =>
  request<Sighting>(() =>
    axios.post(`mascotas/${petId}/sightings/${sightingId}/accept`),
  );

/** Rechaza/descarta un avistamiento (dueño o admin). */
export const rejectSighting = (petId: string, sightingId: string) =>
  request<Sighting>(() =>
    axios.post(`mascotas/${petId}/sightings/${sightingId}/reject`),
  );

/** Un punto del rastro: avistamiento aceptado con coordenadas. */
export type TrailPoint = {
  id: string;
  place: string | null;
  latitud: number;
  longitud: number;
  sightedOn: string | null;
  createdAt: string;
};

/** Rastro público del animal: avistamientos aceptados con coords, cronológico. */
export const getSightingTrail = (id: string) =>
  request<TrailPoint[]>(() => axios.get(`mascotas/${id}/sightings/trail`));

/**
 * Reclamo de mascota: un usuario reporta que una mascota podría ser suya.
 */
export const claimPet = (id: string, data: {
  claimantName: string;
  claimantPhone: string;
  claimantEmail?: string;
  description?: string;
  photos?: File[];
}) => {
  // Multipart: permite adjuntar fotos de prueba (campo "photo", hasta 5).
  const fd = new FormData();
  fd.append("claimantName", data.claimantName);
  fd.append("claimantPhone", data.claimantPhone ?? "");
  if (data.claimantEmail) fd.append("claimantEmail", data.claimantEmail);
  if (data.description) fd.append("description", data.description);
  (data.photos ?? []).forEach((f) => fd.append("photo", f));
  return request<{ ok: boolean; message: string }>(() =>
    axios.post(`mascotas/${id}/claim`, fd),
  );
};

/** Renueva (extiende) el vencimiento de una publicación. */
export const renewPet = (id: string) =>
  request<Pet>(() => axios.post(`mascotas/${id}/renew`));

/**
 * Confirmar devolución: el admin confirma que la mascota fue devuelta a su dueño.
 */
export const confirmReturnPet = (id: string, returnedTo: string) =>
  request<Pet>(() =>
    axios.post(`mascotas/${id}/confirm-return`, { returnedTo }),
  );

/**
 * Aprobar reclamo: el admin confirma que el reclamante es el dueño legítimo.
 * Activa el badge "CON DUEÑO" (isOwner = true). No cierra la publicación.
 * ownerUserId se auto-detecta en el backend desde las notas de reclamo.
 */
export const approveClaimPet = (
  id: string,
  adminNote?: string,
) =>
  request<{ ok: boolean; message: string }>(() =>
    axios.post(`mascotas/${id}/approve-claim`, { adminNote }),
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
  /** Publicaciones activas cuyo vencimiento ya pasó (transversal, no es un reportStatus). */
  vencidas: number;
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
  /** "1" para traer solo las publicaciones vencidas (expiresAt < ahora). */
  vencida?: string;
}) =>
  request<AdminPetsPagedResponse>(() =>
    axios.get(`mascotas/admin/paged`, { params }),
  );

/** Detalle admin de UNA mascota (para abrir el drawer desde otras secciones). */
export const getAdminPet = (id: string) =>
  request<import("@/types/pet").AdminPetSummary>(() =>
    axios.get(`mascotas/admin/pet/${id}`),
  );
