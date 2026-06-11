"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getConversation,
  sendMessage,
  Message,
  ConversationProfile,
} from "@/services/messages.services";

export function useConversation(userId: number | null) {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<ConversationProfile | null>(null);

  const loadConversation = useCallback(
    async (showLoading = true) => {
      if (!userId) return;

      if (showLoading) {
        setLoading(true);
      }

      try {
        const res = await getConversation(userId);

        if (res.ok && res.data) {
          setMessages(res.data.messages);
          setProfile(res.data.profile ?? null);
        }
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [userId],
  );

  useEffect(() => {
    loadConversation();

    if (!userId) return;

    const interval = setInterval(() => {
      loadConversation(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [loadConversation, userId]);

  async function send(content: string) {
    if (!userId) return false;

    const res = await sendMessage(userId, content);

    if (!res.ok || !res.data) {
      return false;
    }

    setMessages((prev) => [...prev, res.data!]);

    return true;
  }

  return {
    loading,
    messages,
    profile,
    send,
    reload: loadConversation,
  };
}
