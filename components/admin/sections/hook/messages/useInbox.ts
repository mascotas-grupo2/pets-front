"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { getInbox, InboxConversation } from "@/services/messages.services";
import { toast } from "sonner";

export function useInbox() {
  const currentUser = useAppSelector((state) => state.user);
  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

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
    const interval = setInterval(fetchInbox, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [fetchInbox]);

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      c.user?.name?.toLowerCase().includes(q) ||
      c.latestMessage?.content?.toLowerCase().includes(q)
    );
  }, [conversations, query]);

  const updateUnreadCount = useCallback((userId: number, newUnreadCount: number) => {
    setConversations(prev => prev.map(c =>
      c.user?.id === userId ? { ...c, unread: newUnreadCount } : c
    ));
  }, []);

  return {
    conversations: filteredConversations,
    loading,
    query,
    setQuery,
    reload: fetchInbox,
    updateUnreadCount,
  };
}
