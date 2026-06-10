"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getConversation,
  getInbox,
  sendMessage,
  type InboxConversation,
  type Message,
} from "@/services/messages.services";
import { useAppSelector } from "@/redux/hooks";

const INBOX_POLL_MS = 15000;
const CHAT_POLL_MS = 5000;

/**
 * Estado y acciones de la mensajería (bandeja + conversación activa).
 * Compartido entre la sección de admin y la vista de cuenta del usuario.
 */
export function useMessages() {
  const currentUser = useAppSelector((state) => state.user);

  const [inbox, setInbox] = useState<InboxConversation[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(true);

  const [activaId, setActivaId] = useState<number | null>(null);
  const [activaMessages, setActivaMessages] = useState<Message[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);

  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const fetchInbox = useCallback(async () => {
    try {
      const res = await getInbox();
      if (res.ok && res.data) {
        setInbox(res.data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching inbox:", error);
    } finally {
      setLoadingInbox(false);
    }
  }, []);

  const fetchChat = useCallback(async (userId: number, showLoading = true) => {
    if (showLoading) setLoadingChat(true);
    try {
      const res = await getConversation(userId);
      if (res.ok && res.data) {
        setActivaMessages(res.data.messages || []);
        // Marcar como leído localmente
        setInbox((prev) =>
          prev.map((c) => (c.user?.id === userId ? { ...c, unread: 0 } : c)),
        );
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
    } finally {
      if (showLoading) setLoadingChat(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser.isLoggedIn) {
      setLoadingInbox(false);
      return;
    }
    void fetchInbox();
    const interval = setInterval(fetchInbox, INBOX_POLL_MS);
    return () => clearInterval(interval);
  }, [currentUser.isLoggedIn, fetchInbox]);

  useEffect(() => {
    if (activaId == null) return;
    void fetchChat(activaId);
    const interval = setInterval(() => void fetchChat(activaId, false), CHAT_POLL_MS);
    return () => clearInterval(interval);
  }, [activaId, fetchChat]);

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inbox;
    return inbox.filter(
      (c) =>
        c.user?.name?.toLowerCase().includes(q) ||
        c.latestMessage?.content?.toLowerCase().includes(q),
    );
  }, [inbox, query]);

  const activaConv = inbox.find((c) => c.user?.id === activaId) ?? null;

  function abrir(id: number) {
    if (id === activaId) return;
    setActivaId(id);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const texto = draft.trim();
    if (!texto || !activaId || sending) return;

    setSending(true);
    try {
      const res = await sendMessage(activaId, texto);
      if (res.ok && res.data) {
        setActivaMessages((prev) => [...prev, res.data!]);
        setDraft("");
        void fetchInbox();
      } else {
        toast.error("No se pudo enviar el mensaje");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSending(false);
    }
  }

  return {
    isLoggedIn: currentUser.isLoggedIn,
    currentUserId: currentUser.id,
    loadingInbox,
    activaId,
    activaMessages,
    loadingChat,
    query,
    setQuery,
    draft,
    setDraft,
    sending,
    visibles,
    activaConv,
    abrir,
    enviar,
  };
}
