import axiosInstance from "./axios";
import { request } from "./request";
const axios = axiosInstance;

export type userMessage = {
  id: number;
  photo: string;
  name: string;
};
export interface Message {
  id: number; // Unique ID of the message
  senderId: number; // ID del remitente
  receiverId: number; // ID del destinatario
  content: string;
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

export interface ConversationProfile {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  status: string;
  evaluationNote: string | null;
}

export interface ConversationResponse {
  messages: Message[];
  profile?: ConversationProfile;
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

export const getAdminInbox = (page = 1, limit = 20) =>
  request<AdminInboxResponse>(() =>
    axios.get(`messages/admin/inbox`, { params: { page, limit } }),
  );

export const getAdminConversations = (page = 1, limit = 20) =>
  request<AdminInboxResponse>(() =>
    axios.get(`messages/admin/conversations`, { params: { page, limit } }),
  );

export const getConversation = (userId: number) =>
  request<ConversationResponse>(() =>
    axios.get(`messages/conversation/${userId}`),
  );

export const sendMessage = (receiverId: number, content: string) =>
  request<Message>(() => axios.post(`messages/`, { receiverId, content }));

export const deleteConversation = (userId: number) =>
  request<void>(() => axios.delete(`messages/conversation/${userId}`));
