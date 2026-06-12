import axiosInstance from "./axios";
import { request } from "./request";

const axios = axiosInstance;

export type Notification = {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

/** Lista las notificaciones del usuario + total sin leer. */
export const getNotifications = (limit = 20) =>
  request<{ items: Notification[]; unread: number }>(() =>
    axios.get("notifications", { params: { limit } }),
  );

/** Solo el contador de no leídas (polling liviano para el badge). */
export const getUnreadCount = () =>
  request<{ unread: number }>(() => axios.get("notifications/unread-count"));

export const markNotificationRead = (id: number) =>
  request<{ ok: true }>(() => axios.patch(`notifications/${id}/read`));

export const markAllNotificationsRead = () =>
  request<{ ok: true }>(() => axios.patch("notifications/read-all"));
