import axiosInstance from "./axios";
import { request } from "./request";

const axios = axiosInstance;

export type CanalMensaje = "usuario" | "interno";

export type Mensaje = {
  id: string;
  /** Autor registrado (null si es una contraparte invitada). El cliente decide
   *  si el mensaje es propio comparándolo con su propio userId. */
  senderUserId: number | null;
  senderName: string;
  texto: string;
  createdAt: string; // ISO
};

export type Conversacion = {
  id: string;
  nombre: string;
  contexto: string;
  asunto: string;
  canal: CanalMensaje;
  noLeidos: number;
  lastMessageAt: string | null; // ISO
  perfil: { email: string; telefono: string; mascota: string };
};

export const getConversations = () =>
  request<Conversacion[]>(() => axios.get("chat/conversations"));

export const getMessages = (
  conversationId: string,
  params?: { limit?: number; before?: string },
) =>
  request<Mensaje[]>(() =>
    axios.get(`chat/conversations/${conversationId}/messages`, { params }),
  );

export const markConversationRead = (conversationId: string) =>
  request<{ ok: true }>(() => axios.patch(`chat/conversations/${conversationId}/read`));
