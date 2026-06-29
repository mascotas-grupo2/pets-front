import axiosInstance from "./axios";
import { request } from "./request";
const axios = axiosInstance;

export type userMessage = {
  id: number;
  photo?: string | null;
  name: string;
  /** Rol del otro participante (lo incluye el back vía publicUser). */
  role?: string;
  email?: string;
  /** Contexto de la última solicitud ("Solicitud de adopción de <mascota>"). */
  context?: string | null;
};
export interface Message {
  id: number; // Unique ID of the message
  senderId: number; // ID del remitente
  receiverId: number; // ID del destinatario
  content: string;
  photo?: string | null;
  read: boolean;
  createdAt: string;
}

export interface InboxConversation {
  user: userMessage;
  latestMessage: Message;
  unread: number;
}

export interface InboxResponse {
  totalUnread: number;
  conversations: InboxConversation[];
}

export interface ConversationNote {
  id: string;
  text: string;
  author: string | null;
  createdAt: string;
}

export interface ConversationProfile {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  status: string;
  evaluationNote: string | null;
  /** "Solicitud de adopción de <mascota>" (de la última solicitud del usuario). */
  context?: string | null;
  /** Id de la última solicitud, para vincular la evaluación. */
  adoptionId?: number | null;
  phone?: string | null;
  town?: string | null;
  /** ID de la mascota reclamada (si la conversación inició con un reclamo). */
  claimPetId?: string | null;
  /** true si la mascota reclamada ya fue devuelta al dueño. */
  claimPetReturned?: boolean;
  /** IDs de TODAS las mascotas reclamadas en esta conversación. */
  claimPetIds?: string[];
  /** Mapa petId → { returned, name } para cada mascota reclamada. */
  claimPetMap?: Record<string, { returned: boolean; name: string }>;
  notes?: ConversationNote[];
}

export interface ConversationResponse {
  messages: Message[];
  profile?: ConversationProfile;
  hasMore?: boolean;
}

export interface AdminInboxConversation {
  user: userMessage;
  latestMessage: Message;
  totalMessages: number;
  unread: number;
}

export interface AdminInboxResponse {
  page: number;
  limit: number;
  total: number;
  conversations: AdminInboxConversation[];
}

export const getInbox = () =>
  request<InboxResponse>(() => axios.get(`messages/inbox`));

export const getConversation = (
  userId: number,
  params?: { before?: number; limit?: number },
) =>
  request<ConversationResponse>(() =>
    axios.get(`messages/conversation/${userId}`, { params }),
  );

export const sendMessage = (receiverId: number, content: string, photo?: File | null) =>
  request<Message>(() => {
    if (photo) {
      const formData = new FormData();
      formData.append("receiverId", receiverId.toString());
      formData.append("content", content);
      formData.append("photo", photo);
      return axios.post(`messages/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    return axios.post(`messages/`, { receiverId, content });
  });

/** Elimina un mensaje puntual (lo puede borrar un participante o un admin). */
export const deleteMessage = (id: number) =>
  request<void>(() => axios.delete(`messages/${id}`));

/**
 * Rechazar un reclamo de mascota.
 * @param petId ID de la mascota
 * @param claimPetId ID del reclamo a rechazar
 * @param reason Motivo del rechazo (opcional)
 */
export async function rejectClaimPet(
  petId: string,
  claimPetId: string,
  reason?: string,
) {
  // El backend espera el ID de la mascota y el motivo en el cuerpo.
  // El claimPetId se incluye para que el frontend pueda identificar la tarjeta.
  // Path relativo: pasa por el proxy (/api/proxy). Con "/api/..." salteaba el proxy → 404.
  return request(() => axios.post(`mascotas/${petId}/reject-claim`, {
    reason,
    claimPetId,
  }));
}

/** Una alerta del carrusel del panel de Mensajes: reclamo pendiente o mascota devuelta. */
export type AdminAlert = {
  id: string;
  type: "reclamo" | "devuelta";
  petId: string | null;
  petName: string;
  petPhoto: string | null;
  personName: string | null;
  description: string;
  link: string;
  userId: number | null;
};

/** Alertas activas del refugio para el carrusel (solo admin). */
export const getAdminAlerts = () =>
  request<{ alerts: AdminAlert[]; total: number }>(() =>
    axios.get("messages/admin/alerts"),
  );
