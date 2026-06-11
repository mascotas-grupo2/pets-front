"use client";

import { useState, useCallback } from "react";

export type PanelMode = "idle" | "new" | "chat";

export function useMessages() {
  const [panelMode, setPanelMode] = useState<PanelMode>("idle");
  const [activeUserId, setActiveUserId] = useState<number | null>(null);

  const openConversation = useCallback((userId: number) => {
    setActiveUserId(userId);
    setPanelMode("chat");
  }, []);

  const openNewMessage = useCallback(() => {
    setActiveUserId(null);
    setPanelMode("new");
  }, []);

  const closePanel = useCallback(() => {
    setActiveUserId(null);
    setPanelMode("idle");
  }, []);

  return {
    panelMode,
    activeUserId,
    openConversation,
    openNewMessage,
    closePanel,
  };
}
