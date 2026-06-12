"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from "@/services/notifications";

const POLL_MS = 20000;

/**
 * Estado de notificaciones (badge + lista) con polling del contador.
 * Compartido por la campana del admin y la vista de la cuenta.
 */
export function useNotifications() {
  const isLoggedIn = useAppSelector((s) => s.user.isLoggedIn);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const res = await getNotifications(20);
    if (res.ok && res.data) {
      setItems(res.data.items);
      setUnread(res.data.unread);
    }
  }, []);

  const pollCount = useCallback(async () => {
    const res = await getUnreadCount();
    if (res.ok && res.data) setUnread(res.data.unread);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setItems([]);
      setUnread(0);
      return;
    }
    void pollCount();
    const id = setInterval(pollCount, POLL_MS);
    return () => clearInterval(id);
  }, [isLoggedIn, pollCount]);

  const load = useCallback(async () => {
    setLoading(true);
    await refresh();
    setLoading(false);
  }, [refresh]);

  const markRead = useCallback(async (id: number) => {
    await markNotificationRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  }, []);

  const markAll = useCallback(async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }, []);

  return { items, unread, loading, load, refresh, markRead, markAll };
}
