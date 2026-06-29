"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { getInbox, InboxConversation } from "@/services/messages.services";
import { onMessageNotification } from "@/components/notifications/useNotifications";
import { toast } from "sonner";

export type TipoConversacion = "todas" | "usuarios" | "internos";

export function useInbox() {
  const currentUser = useAppSelector((state) => state.user);
  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState<TipoConversacion>("todas");

  const fetchInbox = useCallback(async () => {
    if (!currentUser.isLoggedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await getInbox();
      if (res.ok && res.data) {
        setConversations(res.data.conversations || []);
      } else {
        toast.error("No se pudieron cargar las conversaciones.");
      }
    } catch (error) {
      console.error("Error fetching inbox:", error);
      toast.error("Error al cargar las conversaciones.");
    } finally {
      setLoading(false);
    }
  }, [currentUser.isLoggedIn]);

  useEffect(() => {
    fetchInbox();
    // Sin polling: la bandeja se refresca solo cuando llega una notificación de
    // mensaje nuevo por el websocket (useNotifications).
    const unsubscribe = onMessageNotification(() => void fetchInbox());
    return unsubscribe;
  }, [fetchInbox]);

  // Conteos por tipo (sobre el total, no sobre el filtro de búsqueda).
  const counts = useMemo(() => {
    let usuarios = 0;
    let internos = 0;
    for (const c of conversations) {
      if (c.user?.role === "admin") internos++;
      else usuarios++;
    }
    return { todas: conversations.length, usuarios, internos };
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      if (tipo === "usuarios" && c.user?.role === "admin") return false;
      if (tipo === "internos" && c.user?.role !== "admin") return false;
      if (!q) return true;
      return (
        c.user?.name?.toLowerCase().includes(q) ||
        c.latestMessage?.content?.toLowerCase().includes(q)
      );
    });
  }, [conversations, query, tipo]);

  const updateUnreadCount = useCallback((userId: number, newUnreadCount: number) => {
    setConversations(prev => prev.map(c =>
      c.user?.id === userId ? { ...c, unread: newUnreadCount } : c
    ));
  }, []);

  return {
    conversations: filteredConversations,
    counts,
    tipo,
    setTipo,
    loading,
    query,
    setQuery,
    reload: fetchInbox,
    updateUnreadCount,
  };
}
