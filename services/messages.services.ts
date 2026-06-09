import axiosInstance from "./axios";
import { request } from "./request";

const axios = axiosInstance;

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface InboxConversation {
  user: any; // Using any for User to avoid circular deps or missing types if User isn't exported as needed
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
  user: any;
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

export const getInbox = () => request<InboxResponse>(() => axios.get(`messages/inbox`));

export const getAdminInbox = (page = 1, limit = 20) =>
  request<AdminInboxResponse>(() => axios.get(`messages/admin/inbox`, { params: { page, limit } }));

export const getConversation = (userId: number) =>
  request<ConversationResponse>(() => axios.get(`messages/conversation/${userId}`));

export const sendMessage = (receiverId: number, content: string) =>
  request<Message>(() => axios.post(`messages/`, { receiverId, content }));
