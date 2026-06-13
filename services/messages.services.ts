import axiosInstance from "./axios";
import { request } from "./request";
const axios = axiosInstance;

export type userMessage = {
  id: number;
  photo: string;
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
