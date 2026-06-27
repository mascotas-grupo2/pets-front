"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  getConversation,
  sendMessage,
  deleteMessage,
  Message,
  ConversationProfile,
} from "@/services/messages.services";
import { refreshNotifications } from "@/components/notifications/useNotifications";

const PAGE = 30;

export function useConversation(userId: number | null) {
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<ConversationProfile | null>(null);
  // Para que el poll (y loadOlder) lean los mensajes actuales sin recrear callbacks.
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;
  // Espejo del userId activo: los fetch en vuelo descartan su respuesta si la
  // conversación cambió mientras esperaban (evita fuga de mensajes entre charlas).
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  // Carga inicial (última página).
  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getConversation(userId, { limit: PAGE });
      if (userIdRef.current !== userId) return;
      if (res.ok && res.data) {
        setMessages(res.data.messages);
        setProfile(res.data.profile ?? null);
        setHasMore(!!res.data.hasMore);

        refreshNotifications();
      }
    } finally {
      if (userIdRef.current === userId) setLoading(false);
    }
  }, [userId]);

  // Poll: trae la última página y agrega solo los mensajes nuevos.
  const pollLatest = useCallback(async () => {
    if (!userId) return;
    const res = await getConversation(userId, { limit: PAGE });
    if (userIdRef.current !== userId) return;
    if (res.ok && res.data) {
      const fetched = res.data.messages;
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const nuevos = fetched.filter((m) => !ids.has(m.id));
        if (nuevos.length === 0) return prev;
        return [...prev, ...nuevos].sort((a, b) => a.id - b.id);
      });
    }
  }, [userId]);

  // Carga mensajes más viejos (scroll hacia arriba). Devuelve cuántos cargó.
  const loadOlder = useCallback(async (): Promise<number> => {
    const current = messagesRef.current;
    if (!userId || !hasMore || loadingOlder || current.length === 0) return 0;
    setLoadingOlder(true);
    try {
      const res = await getConversation(userId, {
        before: current[0].id,
        limit: PAGE,
      });
      if (userIdRef.current !== userId) return 0;
      if (res.ok && res.data) {
        const older = res.data.messages;
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const nuevos = older.filter((m) => !ids.has(m.id));
          return [...nuevos, ...prev];
        });
        setHasMore(!!res.data.hasMore);
        return older.length;
      }
      return 0;
    } finally {
      setLoadingOlder(false);
    }
  }, [userId, hasMore, loadingOlder]);

  useEffect(() => {
    setMessages([]);
    loadInitial();
    if (!userId) return;
    // Sin polling: la actualizacion en tiempo real llega via WebSocket (useNotifications)
  }, [userId, loadInitial]);

  async function send(content: string, photo?: File | null) {
    if (!userId) return false;
    const res = await sendMessage(userId, content, photo);
    if (!res.ok || !res.data) return false;
    setMessages((prev) => [...prev, res.data!]);
    return true;
  }

  async function remove(messageId: number) {
    const res = await deleteMessage(messageId);
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } else {
      toast.error("No se pudo eliminar el mensaje.");
    }
  }

  return {
    loading,
    loadingOlder,
    hasMore,
    messages,
    profile,
    send,
    remove,
    loadOlder,
    reload: loadInitial,
  };
}
